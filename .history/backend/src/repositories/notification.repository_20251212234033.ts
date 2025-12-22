import { query } from "../config/database";
import {
	Notification,
	CreateNotificationDto,
	NotificationResponse,
} from "../models";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class NotificationRepository {
	// Create notification
	async create(data: CreateNotificationDto): Promise<Notification> {
		const result = await query<ResultSetHeader>(
			`INSERT INTO notifications (user_id, complaint_id, type, message)
       VALUES (?, ?, ?, ?)`,
			[data.user_id, data.complaint_id || null, data.type, data.message]
		);

		const rows = await query<RowDataPacket[]>(
			"SELECT * FROM notifications WHERE id = ?",
			[result.insertId]
		);
		return rows[0] as Notification;
	}

	// Get user's notifications (newest first)
	async findByUserId(
		userId: number,
		limit: number = 50
	): Promise<NotificationResponse[]> {
		const safeLimit = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 50));
		const rows = await query<RowDataPacket[]>(
			`SELECT n.*, c.title as complaint_title
       FROM notifications n
       LEFT JOIN complaints c ON n.complaint_id = c.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT ${safeLimit}`,
			[userId]
		);
		return rows as NotificationResponse[];
	}

	// Get unread count for badge
	async getUnreadCount(userId: number): Promise<number> {
		const rows = await query<RowDataPacket[]>(
			"SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
			[userId]
		);
		return (rows[0] as any).count;
	}

	// Mark notification as read
	async markAsRead(id: number, userId: number): Promise<void> {
		await query(
			"UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
			[id, userId]
		);
	}

	// Mark all notifications as read
	async markAllAsRead(userId: number): Promise<void> {
		await query("UPDATE notifications SET is_read = TRUE WHERE user_id = ?", [
			userId,
		]);
	}

	// Create batch notifications (for multiple users)
	async createBatch(notifications: CreateNotificationDto[]): Promise<void> {
		if (notifications.length === 0) return;

		const values = notifications.map((n) => [
			n.user_id,
			n.complaint_id || null,
			n.type,
			n.message,
		]);

		const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");
		const flatValues = values.flat();

		await query(
			`INSERT INTO notifications (user_id, complaint_id, type, message) VALUES ${placeholders}`,
			flatValues
		);
	}

	// Delete old notifications (cleanup job)
	async deleteOld(daysOld: number = 90): Promise<number> {
		const result = await query<ResultSetHeader>(
			`DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
			[daysOld]
		);
		return result.affectedRows;
	}
}
