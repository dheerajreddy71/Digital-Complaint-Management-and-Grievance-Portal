import { query } from '../config/database';
import { RowDataPacket } from 'mysql2/promise';

// Analytics data for admin dashboard
export interface AnalyticsData {
  statusBreakdown: { status: string; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  priorityBreakdown: { priority: string; count: number }[];
  slaComplianceRate: number;
  averageResolutionTimeHours: number;
  totalComplaints: number;
  resolvedComplaints: number;
  overdueComplaints: number;
  complaintsThisWeek: number;
  complaintsThisMonth: number;
  topLocations: { location: string; count: number }[];
  trendByDay: { date: string; count: number }[];
}

export class AnalyticsService {
  // Get comprehensive analytics for admin dashboard
  async getAnalytics(dateFrom?: Date, dateTo?: Date): Promise<AnalyticsData> {
    const dateFilter = dateFrom && dateTo 
      ? `AND created_at BETWEEN '${dateFrom.toISOString()}' AND '${dateTo.toISOString()}'`
      : '';

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

    return {
      statusBreakdown: statusRows.map((r: any) => ({ status: r.status, count: r.count })),
      categoryBreakdown: categoryRows.map((r: any) => ({ category: r.category, count: r.count })),
      priorityBreakdown: priorityRows.map((r: any) => ({ priority: r.priority, count: r.count })),
      slaComplianceRate: (slaRow[0] as any).rate || 0,
      averageResolutionTimeHours: (avgTimeRow[0] as any).avg_hours || 0,
      totalComplaints: totals.total || 0,
      resolvedComplaints: totals.resolved || 0,
      overdueComplaints: totals.overdue || 0,
      complaintsThisWeek: (weekRow[0] as any).count || 0,
      complaintsThisMonth: (monthRow[0] as any).count || 0,
      topLocations: locationRows.map((r: any) => ({ location: r.location, count: r.count })),
      trendByDay: trendRows.map((r: any) => ({ date: r.date, count: r.count })),
    };
  }
}
