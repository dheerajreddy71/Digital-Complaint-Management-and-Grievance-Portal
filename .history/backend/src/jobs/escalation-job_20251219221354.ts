import cron from "node-cron";
import { ComplaintRepository } from "../repositories/complaint.repository";
import { NotificationService } from "../services/notification.service";
import { logger } from "../utils/logger";

/**
 * Escalation Job
 * 
 * Runs every hour to check for complaints that need escalation
 * Escalates complaints that are:
 * 1. Overdue and not resolved
 * 2. Critical priority and > 50% overdue
 * 3. High priority and > 75% overdue
 */

const complaintRepository = new ComplaintRepository();
const notificationService = new NotificationService();

export const startEscalationJob = () => {
	// Run every hour
	cron.schedule("0 * * * *", async () => {
		try {
			logger.info("Starting escalation check job...");

			const now = new Date();
			
			// Get all non-resolved complaints
			const activeComplaints = await complaintRepository.findAll({
				status: ["Open", "Assigned", "In Progress"],
			});

			let escalatedCount = 0;

			for (const complaint of activeComplaints) {
				// Skip if already escalated
				if (complaint.is_escalated) continue;

				const slaDeadline = new Date(complaint.sla_deadline);
				const isOverdue = now > slaDeadline;

				// Calculate time remaining/overdue percentage
				const createdAt = new Date(complaint.created_at);
				const totalSlaTime = slaDeadline.getTime() - createdAt.getTime();
				const elapsedTime = now.getTime() - createdAt.getTime();
				const percentageElapsed = (elapsedTime / totalSlaTime) * 100;

				let shouldEscalate = false;
				let escalationReason = "";

				// Escalation logic
				if (isOverdue) {
					const overdueHours = Math.floor((now.getTime() - slaDeadline.getTime()) / (1000 * 60 * 60));
					shouldEscalate = true;
					escalationReason = `Complaint is overdue by ${overdueHours} hour${overdueHours > 1 ? "s" : ""}`;
				} else if (complaint.priority === "Critical" && percentageElapsed > 50) {
					shouldEscalate = true;
					escalationReason = `Critical complaint has exceeded 50% of SLA time`;
				} else if (complaint.priority === "High" && percentageElapsed > 75) {
					shouldEscalate = true;
					escalationReason = `High priority complaint has exceeded 75% of SLA time`;
				}

				if (shouldEscalate) {
					// Mark as escalated
					await complaintRepository.update(complaint.id, {
						is_escalated: true,
					});

					// Notify all admins
					await notificationService.notifyAdminsOfEscalation(
						complaint.id,
						complaint.title,
						escalationReason
					);

					// Notify assigned staff (if any)
					if (complaint.assigned_to) {
						await notificationService.createNotification({
							user_id: complaint.assigned_to,
							title: "Complaint Escalated",
							message: `Complaint #${complaint.id} "${complaint.title}" has been escalated. ${escalationReason}`,
							type: "escalation",
							priority: "high",
							related_complaint_id: complaint.id,
						});
					}

					logger.info(`Escalated complaint #${complaint.id}: ${escalationReason}`);
					escalatedCount++;
				}
			}

			logger.info(`Escalation check completed. Escalated ${escalatedCount} complaint(s)`);
		} catch (error) {
			logger.error("Error in escalation job:", error);
		}
	});

	logger.info("Escalation job scheduled (runs every hour)");
};
