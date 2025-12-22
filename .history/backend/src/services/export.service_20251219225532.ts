import { Workbook } from "exceljs";
import PDFDocument from "pdfkit";
import { query } from "../config/database";
import { RowDataPacket } from "mysql2/promise";
import { Writable } from "stream";

export interface ExportOptions {
	format: "csv" | "excel" | "pdf";
	filters?: {
		status?: string;
		category?: string;
		priority?: string;
		dateFrom?: string;
		dateTo?: string;
	};
}

export class ExportService {
	/**
	 * Export complaints data in various formats
	 */
	async exportComplaints(
		options: ExportOptions,
		outputStream: Writable
	): Promise<void> {
		const complaints = await this.fetchComplaintsForExport(options.filters);

		switch (options.format) {
			case "csv":
				await this.generateCSV(complaints, outputStream);
				break;
			case "excel":
				await this.generateExcel(complaints, outputStream);
				break;
			case "pdf":
				await this.generatePDF(complaints, outputStream);
				break;
			default:
				throw new Error("Invalid export format");
		}
	}

	/**
	 * Export analytics report
	 */
	async exportAnalytics(
		format: "excel" | "pdf",
		outputStream: Writable,
		dateFrom?: Date,
		dateTo?: Date
	): Promise<void> {
		const analytics = await this.fetchAnalyticsData(dateFrom, dateTo);

		if (format === "excel") {
			await this.generateAnalyticsExcel(analytics, outputStream);
		} else {
			await this.generateAnalyticsPDF(analytics, outputStream);
		}
	}

	private async fetchComplaintsForExport(
		filters?: ExportOptions["filters"]
	): Promise<any[]> {
		let whereClause = "WHERE 1=1";
		const params: any[] = [];

		if (filters) {
			if (filters.status) {
				whereClause += " AND c.status = ?";
				params.push(filters.status);
			}
			if (filters.category) {
				whereClause += " AND c.category = ?";
				params.push(filters.category);
			}
			if (filters.priority) {
				whereClause += " AND c.priority = ?";
				params.push(filters.priority);
			}
			if (filters.dateFrom && filters.dateTo) {
				whereClause += " AND c.created_at BETWEEN ? AND ?";
				params.push(filters.dateFrom, filters.dateTo);
			}
		}

		const sql = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.priority,
        c.status,
        c.location,
        c.is_overdue,
        c.is_escalated,
        u.name as user_name,
        u.email as user_email,
        staff.name as assigned_staff,
        c.created_at,
        c.updated_at,
        c.resolved_at,
        c.sla_deadline
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users staff ON c.assigned_to = staff.id
      ${whereClause}
      ORDER BY c.created_at DESC
    `;

		const rows = await query<RowDataPacket[]>(sql, params);
		return rows;
	}

	private async fetchAnalyticsData(dateFrom?: Date, dateTo?: Date) {
		const dateFilter =
			dateFrom && dateTo
				? `AND created_at BETWEEN '${dateFrom.toISOString()}' AND '${dateTo.toISOString()}'`
				: "";

		const statusRows = await query<RowDataPacket[]>(
			`SELECT status, COUNT(*) as count FROM complaints WHERE 1=1 ${dateFilter} GROUP BY status`
		);

		const categoryRows = await query<RowDataPacket[]>(
			`SELECT category, COUNT(*) as count FROM complaints WHERE 1=1 ${dateFilter} GROUP BY category`
		);

		const priorityRows = await query<RowDataPacket[]>(
			`SELECT priority, COUNT(*) as count FROM complaints WHERE 1=1 ${dateFilter} GROUP BY priority`
		);

		const totalsRow = await query<RowDataPacket[]>(
			`SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN is_overdue = TRUE AND status != 'Resolved' THEN 1 ELSE 0 END) as overdue
       FROM complaints WHERE 1=1 ${dateFilter}`
		);

		return {
			totals: totalsRow[0],
			by_status: statusRows,
			by_category: categoryRows,
			by_priority: priorityRows,
		};
	}

	private async generateCSV(
		data: any[],
		outputStream: Writable
	): Promise<void> {
		// CSV header
		const headers = [
			"ID",
			"Title",
			"Category",
			"Priority",
			"Status",
			"Location",
			"User",
			"Email",
			"Assigned To",
			"Created",
			"Resolved",
			"SLA Deadline",
			"Overdue",
		];
		outputStream.write(headers.join(",") + "\n");

		// CSV rows
		for (const row of data) {
			const csvRow = [
				row.id,
				`"${row.title?.replace(/"/g, '""') || ""}"`,
				row.category,
				row.priority,
				row.status,
				`"${row.location?.replace(/"/g, '""') || ""}"`,
				row.user_name || "",
				row.user_email || "",
				row.assigned_staff || "Unassigned",
				row.created_at ? new Date(row.created_at).toLocaleString() : "",
				row.resolved_at ? new Date(row.resolved_at).toLocaleString() : "",
				row.sla_deadline ? new Date(row.sla_deadline).toLocaleString() : "",
				row.is_overdue ? "Yes" : "No",
			];
			outputStream.write(csvRow.join(",") + "\n");
		}

		outputStream.end();
	}

	private async generateExcel(
		data: any[],
		outputStream: Writable
	): Promise<void> {
		const workbook = new Workbook();
		const worksheet = workbook.addWorksheet("Complaints");

		// Define columns
		worksheet.columns = [
			{ header: "ID", key: "id", width: 10 },
			{ header: "Title", key: "title", width: 30 },
			{ header: "Category", key: "category", width: 15 },
			{ header: "Priority", key: "priority", width: 12 },
			{ header: "Status", key: "status", width: 15 },
			{ header: "Location", key: "location", width: 25 },
			{ header: "User", key: "user_name", width: 20 },
			{ header: "Email", key: "user_email", width: 25 },
			{ header: "Assigned To", key: "assigned_staff", width: 20 },
			{ header: "Created", key: "created_at", width: 20 },
			{ header: "Resolved", key: "resolved_at", width: 20 },
			{ header: "SLA Deadline", key: "sla_deadline", width: 20 },
			{ header: "Overdue", key: "is_overdue", width: 10 },
		];

		// Style header row
		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF4A90E2" },
		};
		worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

		// Add data rows
		data.forEach((complaint) => {
			worksheet.addRow({
				id: complaint.id,
				title: complaint.title,
				category: complaint.category,
				priority: complaint.priority,
				status: complaint.status,
				location: complaint.location,
				user_name: complaint.user_name,
				user_email: complaint.user_email,
				assigned_staff: complaint.assigned_staff || "Unassigned",
				created_at: complaint.created_at
					? new Date(complaint.created_at).toLocaleString()
					: "",
				resolved_at: complaint.resolved_at
					? new Date(complaint.resolved_at).toLocaleString()
					: "",
				sla_deadline: complaint.sla_deadline
					? new Date(complaint.sla_deadline).toLocaleString()
					: "",
				is_overdue: complaint.is_overdue ? "Yes" : "No",
			});
		});

		// Apply borders
		worksheet.eachRow((row) => {
			row.eachCell((cell) => {
				cell.border = {
					top: { style: "thin" },
					left: { style: "thin" },
					bottom: { style: "thin" },
					right: { style: "thin" },
				};
			});
		});

		await workbook.xlsx.write(outputStream);
		outputStream.end();
	}

	private async generatePDF(
		data: any[],
		outputStream: Writable
	): Promise<void> {
		const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
		doc.pipe(outputStream);

		// Title
		doc.fontSize(20).text("Complaints Export Report", { align: "center" });
		doc.moveDown();
		doc
			.fontSize(10)
			.text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
		doc.moveDown();

		// Summary
		doc.fontSize(12).text(`Total Complaints: ${data.length}`, { align: "left" });
		doc.moveDown();

		// Table headers
		const headers = [
			"ID",
			"Title",
			"Category",
			"Priority",
			"Status",
			"User",
			"Assigned",
		];
		const startY = doc.y;
		const colWidth = 100;
		let x = 30;

		doc.fontSize(10).font("Helvetica-Bold");
		headers.forEach((header) => {
			doc.text(header, x, startY, { width: colWidth, continued: false });
			x += colWidth;
		});

		doc.moveDown();

		// Table rows
		doc.font("Helvetica").fontSize(9);
		data.slice(0, 50).forEach((complaint, index) => {
			// Limit to 50 rows for PDF
			if (doc.y > 550) {
				// New page if needed
				doc.addPage();
			}

			x = 30;
			const rowY = doc.y;

			doc.text(complaint.id, x, rowY, {
				width: colWidth,
				continued: false,
				ellipsis: true,
			});
			x += colWidth;

			doc.text(complaint.title || "", x, rowY, {
				width: colWidth,
				continued: false,
				ellipsis: true,
			});
			x += colWidth;

			doc.text(complaint.category, x, rowY, {
				width: colWidth,
				continued: false,
			});
			x += colWidth;

			doc.text(complaint.priority, x, rowY, {
				width: colWidth,
				continued: false,
			});
			x += colWidth;

			doc.text(complaint.status, x, rowY, {
				width: colWidth,
				continued: false,
			});
			x += colWidth;

			doc.text(complaint.user_name || "", x, rowY, {
				width: colWidth,
				continued: false,
				ellipsis: true,
			});
			x += colWidth;

			doc.text(complaint.assigned_staff || "Unassigned", x, rowY, {
				width: colWidth,
				continued: false,
			});

			doc.moveDown(0.5);
		});

		if (data.length > 50) {
			doc.moveDown();
			doc
				.fontSize(10)
				.text(
					`Note: Only first 50 complaints shown. Total: ${data.length}`,
					{ align: "center" }
				);
		}

		doc.end();
	}

	private async generateAnalyticsExcel(
		analytics: any,
		outputStream: Writable
	): Promise<void> {
		const workbook = new Workbook();

		// Summary sheet
		const summarySheet = workbook.addWorksheet("Summary");
		summarySheet.columns = [
			{ header: "Metric", key: "metric", width: 30 },
			{ header: "Value", key: "value", width: 20 },
		];

		summarySheet.addRow({
			metric: "Total Complaints",
			value: analytics.totals.total,
		});
		summarySheet.addRow({
			metric: "Resolved Complaints",
			value: analytics.totals.resolved,
		});
		summarySheet.addRow({
			metric: "Overdue Complaints",
			value: analytics.totals.overdue,
		});

		// Status breakdown sheet
		const statusSheet = workbook.addWorksheet("By Status");
		statusSheet.columns = [
			{ header: "Status", key: "status", width: 20 },
			{ header: "Count", key: "count", width: 15 },
		];
		analytics.by_status.forEach((row: any) => {
			statusSheet.addRow({ status: row.status, count: row.count });
		});

		// Category breakdown sheet
		const categorySheet = workbook.addWorksheet("By Category");
		categorySheet.columns = [
			{ header: "Category", key: "category", width: 20 },
			{ header: "Count", key: "count", width: 15 },
		];
		analytics.by_category.forEach((row: any) => {
			categorySheet.addRow({ category: row.category, count: row.count });
		});

		// Priority breakdown sheet
		const prioritySheet = workbook.addWorksheet("By Priority");
		prioritySheet.columns = [
			{ header: "Priority", key: "priority", width: 20 },
			{ header: "Count", key: "count", width: 15 },
		];
		analytics.by_priority.forEach((row: any) => {
			prioritySheet.addRow({ priority: row.priority, count: row.count });
		});

		await workbook.xlsx.write(outputStream);
		outputStream.end();
	}

	private async generateAnalyticsPDF(
		analytics: any,
		outputStream: Writable
	): Promise<void> {
		const doc = new PDFDocument({ margin: 50 });
		doc.pipe(outputStream);

		// Title
		doc.fontSize(24).text("Analytics Report", { align: "center" });
		doc.moveDown();
		doc
			.fontSize(12)
			.text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
		doc.moveDown(2);

		// Overview
		doc.fontSize(16).text("Overview", { underline: true });
		doc.moveDown();
		doc.fontSize(12);
		doc.text(`Total Complaints: ${analytics.totals.total}`);
		doc.text(`Resolved: ${analytics.totals.resolved}`);
		doc.text(`Overdue: ${analytics.totals.overdue}`);
		doc.moveDown(2);

		// Status breakdown
		doc.fontSize(16).text("Status Breakdown", { underline: true });
		doc.moveDown();
		doc.fontSize(12);
		analytics.by_status.forEach((row: any) => {
			doc.text(`${row.status}: ${row.count}`);
		});
		doc.moveDown(2);

		// Category breakdown
		doc.fontSize(16).text("Category Breakdown", { underline: true });
		doc.moveDown();
		doc.fontSize(12);
		analytics.by_category.forEach((row: any) => {
			doc.text(`${row.category}: ${row.count}`);
		});
		doc.moveDown(2);

		// Priority breakdown
		doc.fontSize(16).text("Priority Breakdown", { underline: true });
		doc.moveDown();
		doc.fontSize(12);
		analytics.by_priority.forEach((row: any) => {
			doc.text(`${row.priority}: ${row.count}`);
		});

		doc.end();
	}
}
