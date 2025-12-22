import { query } from "../config/database";
import {
	Feedback,
	CreateFeedbackDto,
	FeedbackResponse,
	StaffPerformanceMetrics,
} from "../models";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class FeedbackRepository {
	// Create feedback for resolved complaint
	async create(data: CreateFeedbackDto): Promise<Feedback> {
		const result = await query<ResultSetHeader>(
			`INSERT INTO feedback (complaint_id, rating, review, is_resolved)
       VALUES (?, ?, ?, ?)`,
			[data.complaint_id, data.rating, data.review || null, data.is_resolved]
		);

		const rows = await query<RowDataPacket[]>(
			"SELECT * FROM feedback WHERE id = ?",
			[result.insertId]
		);
		return rows[0] as Feedback;
	}

	// Get feedback for a complaint
	async findByComplaintId(
		complaintId: number
	): Promise<FeedbackResponse | null> {
		const rows = await query<RowDataPacket[]>(
			`SELECT f.*, c.title as complaint_title, c.user_id, c.assigned_to,
              u.name as user_name, s.name as assigned_staff_name
       FROM feedback f
       JOIN complaints c ON f.complaint_id = c.id
       JOIN users u ON c.user_id = u.id
       LEFT JOIN users s ON c.assigned_to = s.id
       WHERE f.complaint_id = ?`,
			[complaintId]
		);
		return rows.length > 0 ? (rows[0] as FeedbackResponse) : null;
	}

	// Check if feedback exists for a complaint
	async exists(complaintId: number): Promise<boolean> {
		const rows = await query<RowDataPacket[]>(
			"SELECT id FROM feedback WHERE complaint_id = ?",
			[complaintId]
		);
		return rows.length > 0;
	}

	// Get staff performance metrics (for analytics dashboard)
	async getStaffPerformance(): Promise<StaffPerformanceMetrics[]> {
		const rows = await query<RowDataPacket[]>(
			`SELECT 
        u.id as staff_id,
        u.name as staff_name,
        COUNT(DISTINCT c.id) as total_resolved,
        COALESCE(AVG(f.rating), 0) as average_rating,
        COUNT(f.id) as total_feedbacks,
        ROUND(
          SUM(CASE WHEN c.is_overdue = FALSE THEN 1 ELSE 0 END) * 100.0 / 
          NULLIF(COUNT(c.id), 0), 1
        ) as sla_compliance_rate,
        ROUND(
          AVG(TIMESTAMPDIFF(HOUR, c.created_at, c.resolved_at)), 1
        ) as average_resolution_time_hours
       FROM users u
       LEFT JOIN complaints c ON u.id = c.assigned_to AND c.status = 'Resolved'
       LEFT JOIN feedback f ON c.id = f.complaint_id
       WHERE u.role = 'Staff' AND u.is_active = TRUE
       GROUP BY u.id, u.name
       ORDER BY average_rating DESC`
		);
		return rows as StaffPerformanceMetrics[];
	}

	// Get average rating for a specific staff member
	async getStaffRating(staffId: number): Promise<number> {
		const rows = await query<RowDataPacket[]>(
			`SELECT AVG(f.rating) as avg_rating
       FROM feedback f
       JOIN complaints c ON f.complaint_id = c.id
       WHERE c.assigned_to = ?`,
			[staffId]
		);
		return (rows[0] as any).avg_rating || 0;
	}

	// Get all feedback (for admin analytics)
	async findAll(limit: number = 50): Promise<FeedbackResponse[]> {
		const rows = await query<RowDataPacket[]>(
			`SELECT f.*, c.title as complaint_title, c.user_id, c.assigned_to,
              u.name as user_name, s.name as assigned_staff_name
       FROM feedback f
       JOIN complaints c ON f.complaint_id = c.id
       JOIN users u ON c.user_id = u.id
       LEFT JOIN users s ON c.assigned_to = s.id
       ORDER BY f.submitted_at DESC
       LIMIT ?`,
			[limit]
		);
		return rows as FeedbackResponse[];
	}
}
