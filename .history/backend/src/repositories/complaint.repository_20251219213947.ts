import { query, getConnection } from "../config/database";
import {
	Complaint,
	CreateComplaintDto,
	UpdateComplaintDto,
	ComplaintResponse,
	ComplaintFilters,
	PaginatedResponse,
	DuplicateCheckResult,
} from "../models";
import { calculateSlaDeadline, isOverdue } from "../utils";
import { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise";

export class ComplaintRepository {
	// Create new complaint with SLA deadline
	async create(
		userId: number,
		data: CreateComplaintDto
	): Promise<ComplaintResponse> {
		const slaDeadline = calculateSlaDeadline(data.priority);
		const attachments = JSON.stringify(data.attachments || []);

		const result = await query<ResultSetHeader>(
			`INSERT INTO complaints 
       (user_id, title, description, category, priority, location, status, sla_deadline, attachments)
       VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?)`,
			[
				userId,
				data.title,
				data.description,
				data.category,
				data.priority,
				data.location,
				slaDeadline,
				attachments,
			]
		);

		return this.findById(result.insertId) as Promise<ComplaintResponse>;
	}

	// Find complaint by ID with user and staff info
	async findById(id: number): Promise<ComplaintResponse | null> {
		const rows = await query<RowDataPacket[]>(
			`SELECT c.*, 
              u.name as user_name, u.email as user_email,
              s.name as assigned_staff_name, s.email as staff_email
       FROM complaints c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN users s ON c.assigned_to = s.id
       WHERE c.id = ?`,
			[id]
		);

		if (rows.length === 0) return null;
		return this.toResponse(rows[0] as any);
	}

	// Get complaints with filters, pagination, and sorting
	async findAll(
		filters: ComplaintFilters
	): Promise<PaginatedResponse<ComplaintResponse>> {
		const page = filters.page || 1;
		const limit = Math.max(1, filters.limit || 10);
		const offset = Math.max(0, (page - 1) * limit);

		let whereConditions: string[] = [];
		let params: unknown[] = [];

		if (filters.status) {
			whereConditions.push("c.status = ?");
			params.push(filters.status);
		}
		if (filters.category) {
			whereConditions.push("c.category = ?");
			params.push(filters.category);
		}
		if (filters.priority) {
			whereConditions.push("c.priority = ?");
			params.push(filters.priority);
		}
		if (filters.user_id) {
			whereConditions.push("c.user_id = ?");
			params.push(filters.user_id);
		}
		if (filters.staff_id) {
			whereConditions.push("c.assigned_to = ?");
			params.push(filters.staff_id);
		}
		if (filters.assigned_to === "null" || filters.assigned_to === null) {
			whereConditions.push("c.assigned_to IS NULL");
		} else if (filters.assigned_to) {
			whereConditions.push("c.assigned_to = ?");
			params.push(filters.assigned_to);
		}
		if (filters.is_overdue !== undefined) {
			whereConditions.push("c.is_overdue = ?");
			params.push(filters.is_overdue);
		}
		if (filters.is_escalated !== undefined) {
			whereConditions.push("c.is_escalated = ?");
			params.push(filters.is_escalated);
		}
		if (filters.search) {
			whereConditions.push(
				"(c.title LIKE ? OR c.description LIKE ? OR c.location LIKE ?)"
			);
			const searchTerm = `%${filters.search}%`;
			params.push(searchTerm, searchTerm, searchTerm);
		}
		if (filters.date_from) {
			whereConditions.push("c.created_at >= ?");
			params.push(filters.date_from);
		}
		if (filters.date_to) {
			whereConditions.push("c.created_at <= ?");
			params.push(filters.date_to);
		}

		const whereClause =
			whereConditions.length > 0
				? "WHERE " + whereConditions.join(" AND ")
				: "";

		// Determine sort order
		const sortBy = filters.sort_by || "created_at";
		const sortOrder = filters.sort_order || "desc";
		const orderClause = `ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}`;

		// Ensure limit and offset are valid integers
		const limitNum = parseInt(String(limit), 10);
		const offsetNum = parseInt(String(offset), 10);

		if (isNaN(limitNum) || isNaN(offsetNum) || limitNum < 1 || offsetNum < 0) {
			throw new Error("Invalid pagination parameters");
		}

		// Filter out any undefined or null values from params
		const cleanParams = params.filter((p) => p !== undefined && p !== null);

		// Get total count
		const countRows = await query<RowDataPacket[]>(
			`SELECT COUNT(*) as total FROM complaints c ${whereClause}`,
			cleanParams
		);
		const total = (countRows[0] as any).total;

		// MySQL prepared statements have issues with LIMIT/OFFSET parameters
		// Since we've validated these are safe integers, use them directly in SQL
		const rows = await query<RowDataPacket[]>(
			`SELECT c.*, 
              u.name as user_name, u.email as user_email,
              s.name as assigned_staff_name, s.email as staff_email
       FROM complaints c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN users s ON c.assigned_to = s.id
       ${whereClause}
       ${orderClause}
       LIMIT ${limitNum} OFFSET ${offsetNum}`,
			cleanParams
		);

		return {
			data: rows.map((row) => this.toResponse(row as any)),
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	// Update complaint
	async update(
		id: number,
		data: UpdateComplaintDto
	): Promise<ComplaintResponse | null> {
		const fields: string[] = [];
		const values: unknown[] = [];

		if (data.title) {
			fields.push("title = ?");
			values.push(data.title);
		}
		if (data.description) {
			fields.push("description = ?");
			values.push(data.description);
		}
		if (data.category) {
			fields.push("category = ?");
			values.push(data.category);
		}
		if (data.priority) {
			fields.push("priority = ?");
			values.push(data.priority);
			// Recalculate SLA when priority changes
			fields.push("sla_deadline = ?");
			values.push(calculateSlaDeadline(data.priority));
		}
		if (data.location) {
			fields.push("location = ?");
			values.push(data.location);
		}
		if (data.status) {
			fields.push("status = ?");
			values.push(data.status);
			if (data.status === "Resolved") {
				fields.push("resolved_at = NOW()");
			}
		}
		if (data.assigned_to !== undefined) {
			fields.push("assigned_to = ?");
			values.push(data.assigned_to);
		}

		if (fields.length === 0) return null;

		values.push(id);
		await query(
			`UPDATE complaints SET ${fields.join(
				", "
			)}, updated_at = NOW() WHERE id = ?`,
			values
		);

		return this.findById(id);
	}

	// Assign staff to complaint
	async assign(
		complaintId: number,
		staffId: number
	): Promise<ComplaintResponse | null> {
		await query(
			`UPDATE complaints 
       SET assigned_to = ?, status = 'Assigned', updated_at = NOW() 
       WHERE id = ?`,
			[staffId, complaintId]
		);
		return this.findById(complaintId);
	}

	// Check for duplicate complaints (same category, location, within 7 days)
	async checkDuplicates(
		data: CreateComplaintDto,
		userId: number
	): Promise<DuplicateCheckResult> {
		const rows = await query<RowDataPacket[]>(
			`SELECT * FROM complaints 
       WHERE user_id = ? 
       AND category = ? 
       AND location = ?
       AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
       AND status != 'Resolved'`,
			[userId, data.category, data.location]
		);

		// Also check for similar titles (simple string matching)
		const titleRows = await query<RowDataPacket[]>(
			`SELECT * FROM complaints 
       WHERE user_id = ?
       AND LOWER(title) LIKE ?
       AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
       AND status != 'Resolved'`,
			[userId, `%${data.title.toLowerCase().substring(0, 20)}%`]
		);

		const duplicates = [...rows, ...titleRows].reduce((acc, curr) => {
			if (!acc.find((c: any) => c.id === (curr as any).id)) {
				acc.push(curr as Complaint);
			}
			return acc;
		}, [] as Complaint[]);

		return {
			hasDuplicates: duplicates.length > 0,
			duplicates,
		};
	}

	// Flag overdue complaints (called by scheduled job)
	async updateOverdueStatus(): Promise<number> {
		const result = await query<ResultSetHeader>(
			`UPDATE complaints 
       SET is_overdue = TRUE, updated_at = NOW()
       WHERE status != 'Resolved' 
       AND sla_deadline < NOW() 
       AND is_overdue = FALSE`
		);
		return result.affectedRows;
	}

	// Check for recurring complaints (same location + category, >3 times in 30 days)
	async checkRecurring(category: string, location: string): Promise<boolean> {
		const rows = await query<RowDataPacket[]>(
			`SELECT COUNT(*) as count FROM complaints 
       WHERE category = ? 
       AND location = ?
       AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
			[category, location]
		);
		return (rows[0] as any).count > 3;
	}

	// Mark complaint as recurring
	async markAsRecurring(id: number): Promise<void> {
		await query("UPDATE complaints SET is_recurring = TRUE WHERE id = ?", [id]);
	}

	// Escalate complaint (SLA breach + grace period)
	async escalate(id: number): Promise<void> {
		await query(
			`UPDATE complaints 
       SET is_escalated = TRUE, priority = 'Critical', updated_at = NOW() 
       WHERE id = ?`,
			[id]
		);
	}

	// Get complaints approaching SLA deadline (within 2 hours)
	async getApproachingSLA(): Promise<ComplaintResponse[]> {
		const rows = await query<RowDataPacket[]>(
			`SELECT c.*, 
              u.name as user_name, u.email as user_email,
              s.name as assigned_staff_name, s.email as staff_email
       FROM complaints c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN users s ON c.assigned_to = s.id
       WHERE c.status != 'Resolved'
       AND c.sla_deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)
       AND c.is_overdue = FALSE`
		);
		return rows.map((row) => this.toResponse(row as any));
	}

	// Delete complaint (admin only)
	async delete(id: number): Promise<void> {
		await query("DELETE FROM complaints WHERE id = ?", [id]);
	}

	// Convert DB row to response format
	private toResponse(row: any): ComplaintResponse {
		return {
			id: row.id,
			user_id: row.user_id,
			assigned_to: row.assigned_to,
			title: row.title,
			description: row.description,
			category: row.category,
			priority: row.priority,
			location: row.location,
			status: row.status,
			sla_deadline: row.sla_deadline,
			is_overdue: Boolean(row.is_overdue),
			is_escalated: Boolean(row.is_escalated),
			is_recurring: Boolean(row.is_recurring),
			attachments: row.attachments ? JSON.parse(row.attachments) : [],
			created_at: row.created_at,
			updated_at: row.updated_at,
			resolved_at: row.resolved_at,
			user_name: row.user_name,
			user_email: row.user_email,
			assigned_staff_name: row.assigned_staff_name || null,
			staff_email: row.staff_email || null,
		};
	}
			staff_name: row.staff_name,
			staff_email: row.staff_email,
		};
	}
}
