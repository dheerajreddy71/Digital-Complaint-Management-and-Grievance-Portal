import { query } from "../config/database";
import { Comment, CreateCommentDto, CommentResponse } from "../models";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class CommentRepository {
	// Create comment
	async create(
		userId: number,
		data: CreateCommentDto
	): Promise<CommentResponse> {
		const attachments = JSON.stringify(data.attachments || []);

		const result = await query<ResultSetHeader>(
			`INSERT INTO comments (complaint_id, user_id, content, attachments)
       VALUES (?, ?, ?, ?)`,
			[data.complaint_id, userId, data.content, attachments]
		);

		return this.findById(result.insertId) as Promise<CommentResponse>;
	}

	// Get comment by ID
	async findById(id: number): Promise<CommentResponse | null> {
		const rows = await query<RowDataPacket[]>(
			`SELECT c.*, u.name as user_name, u.role as user_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
			[id]
		);

		if (rows.length === 0) return null;
		return this.toResponse(rows[0] as any);
	}

	// Get all comments for a complaint (chronological)
	async findByComplaintId(complaintId: number): Promise<CommentResponse[]> {
		const rows = await query<RowDataPacket[]>(
			`SELECT c.*, u.name as user_name, u.role as user_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.complaint_id = ?
       ORDER BY c.created_at ASC`,
			[complaintId]
		);
		return rows.map((row) => this.toResponse(row as any));
	}

	// Delete comment (only by author)
	async delete(id: number, userId: number): Promise<boolean> {
		const result = await query<ResultSetHeader>(
			"DELETE FROM comments WHERE id = ? AND user_id = ?",
			[id, userId]
		);
		return result.affectedRows > 0;
	}

	private toResponse(row: any): CommentResponse {
		return {
			id: row.id,
			complaint_id: row.complaint_id,
			user_id: row.user_id,
			content: row.content,
			attachments: row.attachments ? JSON.parse(row.attachments) : [],
			created_at: row.created_at,
			user_name: row.user_name,
			user_role: row.user_role,
		};
	}
}
