import { NotificationRepository } from "../repositories";
import { UserRepository } from "../repositories/user.repository";
import {
	Notification,
	CreateNotificationDto,
	NotificationResponse,
} from "../models";

export class NotificationService {
	private notificationRepo = new NotificationRepository();
	private userRepo = new UserRepository();

	// Get user's notifications
	async getUserNotifications(
		userId: number,
		limit: number = 50
	): Promise<NotificationResponse[]> {
		return this.notificationRepo.findByUserId(userId, limit);
	}

	// Get unread count for badge
	async getUnreadCount(userId: number): Promise<number> {
		return this.notificationRepo.getUnreadCount(userId);
	}

	// Mark single notification as read
	async markAsRead(notificationId: number, userId: number): Promise<void> {
		await this.notificationRepo.markAsRead(notificationId, userId);
	}

	// Mark all as read
	async markAllAsRead(userId: number): Promise<void> {
		await this.notificationRepo.markAllAsRead(userId);
	}

	// Create notification
	async createNotification(data: CreateNotificationDto): Promise<Notification> {
		return this.notificationRepo.create(data);
	}

	// Create multiple notifications
	async createBatch(notifications: CreateNotificationDto[]): Promise<void> {
		await this.notificationRepo.createBatch(notifications);
	}

	// Notify all admins of escalation
	async notifyAdminsOfEscalation(
		complaintId: number,
		complaintTitle: string,
		reason: string
	): Promise<void> {
		// Get all admin users
		const admins = await this.userRepo.findAllAdmins();

		const notifications: CreateNotificationDto[] = admins.map((admin) => ({
			user_id: admin.id,
			complaint_id: complaintId,
			message: `⚠️ Escalated: Complaint #${complaintId} "${complaintTitle}" - ${reason}`,
			type: "escalation",
		}));

		if (notifications.length > 0) {
			await this.createBatch(notifications);
		}
	}
}
