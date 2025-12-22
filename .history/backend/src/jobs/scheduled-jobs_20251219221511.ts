import cron from "node-cron";
import {
	ComplaintRepository,
	NotificationRepository,
	UserRepository,
} from "../repositories";
import { NotificationService } from "../services";
import { logger } from "../utils";

const complaintRepo = new ComplaintRepository();
const notificationRepo = new NotificationRepository();
const notificationService = new NotificationService();
const userRepo = new UserRepository();

// Check for overdue complaints every hour as per spec
export const startSlaCheckJob = () => {
	cron.schedule("0 * * * *", async () => {
		try {
			logger.info("Running SLA check job...");

			// Update overdue flags
			const overdueCount = await complaintRepo.updateOverdueStatus();

			if (overdueCount > 0) {
				logger.info(`Marked ${overdueCount} complaints as overdue`);

				// Notify admins about SLA breaches
				const admins = await userRepo.findAll();
				for (const admin of admins.filter((u) => u.role === "Admin")) {
					await notificationRepo.create({
						user_id: admin.id,
						type: "SLABreach",
						message: `${overdueCount} complaint(s) have exceeded their SLA deadline`,
					});
				}
			}
		} catch (error) {
			logger.error("SLA check job failed", { error });
		}
	});

	logger.info("SLA check job scheduled (every hour)");
};

// Check for approaching SLA deadlines (within 2 hours) every 30 minutes
export const startSlaReminderJob = () => {
	cron.schedule("*/30 * * * *", async () => {
		try {
			logger.info("Running SLA reminder job...");

			const approachingComplaints = await complaintRepo.getApproachingSLA();

			for (const complaint of approachingComplaints) {
				// Notify assigned staff
				if (complaint.assigned_to) {
					await notificationRepo.create({
						user_id: complaint.assigned_to,
						complaint_id: complaint.id,
						type: "Reminder",
						message: `SLA deadline approaching for "${complaint.title}" - less than 2 hours remaining`,
					});
				}
			}

			if (approachingComplaints.length > 0) {
				logger.info(
					`Sent SLA reminders for ${approachingComplaints.length} complaints`
				);
			}
		} catch (error) {
			logger.error("SLA reminder job failed", { error });
		}
	});

	logger.info("SLA reminder job scheduled (every 30 minutes)");
};

// Check for escalation (overdue complaints) every hour
export const startEscalationJob = () => {
	cron.schedule("0 * * * *", async () => {
		try {
			logger.info("Running escalation check job...");

			const now = new Date();

			// Get all non-resolved complaints
			const activeComplaints = await complaintRepo.findAll({
				status: ["Open", "Assigned", "In Progress"],
			});

			let escalatedCount = 0;

			for (const complaint of activeComplaints) {
				// Skip if already escalated
				if (complaint.is_escalated) continue;

				const slaDeadline = new Date(complaint.sla_deadline);
				const isOverdue = now > slaDeadline;

				// Calculate percentage elapsed
				const createdAt = new Date(complaint.created_at);
				const totalSlaTime = slaDeadline.getTime() - createdAt.getTime();
				const elapsedTime = now.getTime() - createdAt.getTime();
				const percentageElapsed = (elapsedTime / totalSlaTime) * 100;

				let shouldEscalate = false;
				let escalationReason = "";

				// Escalation logic
				if (isOverdue) {
					const overdueHours = Math.floor(
						(now.getTime() - slaDeadline.getTime()) / (1000 * 60 * 60)
					);
					shouldEscalate = true;
					escalationReason = `Overdue by ${overdueHours} hour${
						overdueHours > 1 ? "s" : ""
					}`;
				} else if (complaint.priority === "Critical" && percentageElapsed > 50) {
					shouldEscalate = true;
					escalationReason = `Critical complaint exceeded 50% of SLA time`;
				} else if (complaint.priority === "High" && percentageElapsed > 75) {
					shouldEscalate = true;
					escalationReason = `High priority complaint exceeded 75% of SLA time`;
				}

				if (shouldEscalate) {
					// Mark as escalated
					await complaintRepo.update(complaint.id, {
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
						await notificationRepo.create({
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

			logger.info(
				`Escalation check completed. Escalated ${escalatedCount} complaint(s)`
			);
		} catch (error) {
			logger.error("Escalation job failed", { error });
		}
	});

	logger.info("Escalation job scheduled (every hour)");
};

// Clean up expired refresh tokens daily
export const startTokenCleanupJob = () => {
	cron.schedule("0 0 * * *", async () => {
		try {
			logger.info("Running token cleanup job...");
			// Import here to avoid circular dependencies
			const { RefreshTokenRepository } = await import("../repositories");
			const tokenRepo = new RefreshTokenRepository();
			const deleted = await tokenRepo.deleteExpired();
			logger.info(`Cleaned up ${deleted} expired refresh tokens`);
		} catch (error) {
			logger.error("Token cleanup job failed", { error });
		}
	});

	logger.info("Token cleanup job scheduled (daily at midnight)");
};

// Clean up old notifications (older than 90 days)
export const startNotificationCleanupJob = () => {
	cron.schedule("0 1 * * *", async () => {
		try {
			logger.info("Running notification cleanup job...");
			const deleted = await notificationRepo.deleteOld(90);
			logger.info(`Cleaned up ${deleted} old notifications`);
		} catch (error) {
			logger.error("Notification cleanup job failed", { error });
		}
	});

	logger.info("Notification cleanup job scheduled (daily at 1 AM)");
};

// Start all scheduled jobs
export const startAllJobs = () => {
	startSlaCheckJob();
	startSlaReminderJob();
	startEscalationJob();
	startTokenCleanupJob();
	startNotificationCleanupJob();
	logger.info("All scheduled jobs started");
};
