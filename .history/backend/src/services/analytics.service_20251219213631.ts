import { query } from "../config/database";
import { RowDataPacket } from "mysql2/promise";

// Staff Performance Metrics interface
export interface StaffPerformanceMetrics {
	staff_id: string;
	staff_name: string;
	total_assigned: number;
	total_resolved: number;
	in_progress_count: number;
	overdue_count: number;
	average_resolution_hours: number;
	average_rating: number;
}

// Analytics data for admin dashboard
export interface AnalyticsData {
	overview: {
		total_complaints: number;
		pending_complaints: number;
		resolved_complaints: number;
		overdue_complaints: number;
		average_resolution_hours: number;
		sla_compliance_rate: number;
	};
	by_status: { status: string; count: number }[];
	by_category: { category: string; count: number }[];
	by_priority: { priority: string; count: number }[];
	trends: { date: string; count: number }[];
	staff_performance: StaffPerformanceMetrics[];
	top_locations: { location: string; count: number }[];
}

export class AnalyticsService {
	// Get comprehensive analytics for admin dashboard
	async getAnalytics(dateFrom?: Date, dateTo?: Date): Promise<AnalyticsData> {
		const dateFilter =
			dateFrom && dateTo
				? `AND created_at BETWEEN '${dateFrom.toISOString()}' AND '${dateTo.toISOString()}'`
				: "";

		// Status breakdown
		const statusRows = await query<RowDataPacket[]>(
			`SELECT status, COUNT(*) as count FROM complaints WHERE 1=1 ${dateFilter} GROUP BY status`
		);

		// Category breakdown
		const categoryRows = await query<RowDataPacket[]>(
			`SELECT category, COUNT(*) as count FROM complaints WHERE 1=1 ${dateFilter} GROUP BY category`
		);

		// Priority breakdown
		const priorityRows = await query<RowDataPacket[]>(
			`SELECT priority, COUNT(*) as count FROM complaints WHERE 1=1 ${dateFilter} GROUP BY priority`
		);

		// Total and resolved counts
		const totalsRow = await query<RowDataPacket[]>(
			`SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN is_overdue = TRUE AND status != 'Resolved' THEN 1 ELSE 0 END) as overdue
       FROM complaints WHERE 1=1 ${dateFilter}`
		);
		const totals = totalsRow[0] as any;

		// SLA compliance rate
		const slaRow = await query<RowDataPacket[]>(
			`SELECT 
        ROUND(
          SUM(CASE WHEN is_overdue = FALSE AND status = 'Resolved' THEN 1 ELSE 0 END) * 100.0 / 
          NULLIF(SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END), 0), 1
        ) as rate
       FROM complaints WHERE 1=1 ${dateFilter}`
		);

		// Average resolution time
		const avgTimeRow = await query<RowDataPacket[]>(
			`SELECT ROUND(AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)), 1) as avg_hours
       FROM complaints 
       WHERE status = 'Resolved' AND resolved_at IS NOT NULL ${dateFilter}`
		);

		// This week's complaints
		const weekRow = await query<RowDataPacket[]>(
			`SELECT COUNT(*) as count FROM complaints 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
		);

		// This month's complaints
		const monthRow = await query<RowDataPacket[]>(
			`SELECT COUNT(*) as count FROM complaints 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
		);

		// Top locations
		const locationRows = await query<RowDataPacket[]>(
			`SELECT location, COUNT(*) as count FROM complaints 
       WHERE 1=1 ${dateFilter}
       GROUP BY location ORDER BY count DESC LIMIT 10`
		);

		// Daily trend (last 30 days)
		const trendRows = await query<RowDataPacket[]>(
			`SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM complaints 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`
		);

		// Staff performance metrics
		const staffPerformanceRows = await query<RowDataPacket[]>(
			`SELECT 
        u.id as staff_id,
        u.name as staff_name,
        COUNT(CASE WHEN c.assigned_to = u.id THEN 1 END) as total_assigned,
        COUNT(CASE WHEN c.assigned_to = u.id AND c.status = 'Resolved' THEN 1 END) as total_resolved,
        COUNT(CASE WHEN c.assigned_to = u.id AND c.status = 'In-progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN c.assigned_to = u.id AND c.is_overdue = TRUE AND c.status != 'Resolved' THEN 1 END) as overdue_count,
        ROUND(AVG(CASE WHEN c.assigned_to = u.id AND c.status = 'Resolved' AND c.resolved_at IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, c.created_at, c.resolved_at) END), 1) as average_resolution_hours,
        COALESCE(ROUND(AVG(f.rating), 1), 0) as average_rating
      FROM users u
      LEFT JOIN complaints c ON u.id = c.assigned_to ${
				dateFilter ? dateFilter.replace("AND", "AND c.") : ""
			}
      LEFT JOIN feedback f ON c.id = f.complaint_id
      WHERE u.role = 'Staff'
      GROUP BY u.id, u.name
      HAVING total_assigned > 0
      ORDER BY total_resolved DESC`
		);

		return {
			overview: {
				total_complaints: totals.total || 0,
				pending_complaints:
					statusRows.find((r: any) => r.status === "Open")?.count || 0,
				resolved_complaints: totals.resolved || 0,
				overdue_complaints: totals.overdue || 0,
				average_resolution_hours: (avgTimeRow[0] as any).avg_hours || 0,
				sla_compliance_rate: (slaRow[0] as any).rate || 0,
			},
			by_status: statusRows.map((r: any) => ({
				status: r.status,
				count: Number(r.count),
			})),
			by_category: categoryRows.map((r: any) => ({
				category: r.category,
				count: Number(r.count),
			})),
			by_priority: priorityRows.map((r: any) => ({
				priority: r.priority,
				count: Number(r.count),
			})),
			trends: trendRows.map((r: any) => ({
				date: r.date,
				count: Number(r.count),
			})),
			staff_performance: staffPerformanceRows.map((r: any) => ({
				staff_id: String(r.staff_id),
				staff_name: r.staff_name,
				total_assigned: Number(r.total_assigned) || 0,
				total_resolved: Number(r.total_resolved) || 0,
				in_progress_count: Number(r.in_progress_count) || 0,
				overdue_count: Number(r.overdue_count) || 0,
				average_resolution_hours: Number(r.average_resolution_hours) || 0,
				average_rating: Number(r.average_rating) || 0,
			})),
			top_locations: locationRows.map((r: any) => ({
				location: r.location,
				count: Number(r.count),
			})),
		};
	}
}
