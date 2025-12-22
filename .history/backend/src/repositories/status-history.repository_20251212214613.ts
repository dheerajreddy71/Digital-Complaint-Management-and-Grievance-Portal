import { query } from "../config/database";
import {
	StatusHistory,
	CreateStatusHistoryDto,
	StatusHistoryResponse,
} from "../models";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class StatusHistoryRepository {
	// Create status history entry
	async create(data: CreateStatusHistoryDto): Promise<StatusHistory> {
		const result = await query<ResultSetHeader>(
			`INSERT INTO status_history (complaint_id, previous_status, new_status, updated_by, notes)
       VALUES (?, ?, ?, ?, ?)`,
			[
				data.complaint_id,
				data.previous_status,
				data.new_status,
				data.updated_by,
				data.notes || null,
			]
		);

		const rows = await query<RowDataPacket[]>(
			"SELECT * FROM status_history WHERE id = ?",
			[result.insertId]
		);
		return rows[0] as StatusHistory;
	}

	// Get complete timeline for a complaint (who did what and when)
	async getComplaintTimeline(
		complaintId: number
	): Promise<StatusHistoryResponse[]> {
		const rows = await query<RowDataPacket[]>(
			`SELECT sh.*, u.name as updated_by_name, u.role as updated_by_role
       FROM status_history sh
       JOIN users u ON sh.updated_by = u.id
       WHERE sh.complaint_id = ?
       ORDER BY sh.timestamp ASC`,
			[complaintId]
		);
		return rows as StatusHistoryResponse[];
	}

	// Get latest status update for a complaint
	async getLatest(complaintId: number): Promise<StatusHistory | null> {
		const rows = await query<RowDataPacket[]>(
			`SELECT * FROM status_history 
       WHERE complaint_id = ? 
       ORDER BY timestamp DESC 
       LIMIT 1`,
			[complaintId]
		);
		return rows.length > 0 ? (rows[0] as StatusHistory) : null;
	}
}
