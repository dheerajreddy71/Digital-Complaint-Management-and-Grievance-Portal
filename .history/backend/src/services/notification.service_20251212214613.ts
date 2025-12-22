import { NotificationRepository } from "../repositories";
import {
	Notification,
	CreateNotificationDto,
	NotificationResponse,
} from "../models";

export class NotificationService {
	private notificationRepo = new NotificationRepository();

	// Get user's notifications
	async getUserNotifications(userId: number): Promise<NotificationResponse[]> {
		return this.notificationRepo.findByUserId(userId);
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
	async create(data: CreateNotificationDto): Promise<Notification> {
		return this.notificationRepo.create(data);
	}

	// Create multiple notifications
	async createBatch(notifications: CreateNotificationDto[]): Promise<void> {
		await this.notificationRepo.createBatch(notifications);
	}
}
