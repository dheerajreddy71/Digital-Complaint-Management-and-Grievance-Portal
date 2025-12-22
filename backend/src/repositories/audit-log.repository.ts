import { query } from "../config/database";
import { AuditLog, CreateAuditLogDto } from "../models";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class AuditLogRepository {
	// Create audit log entry
	async create(data: CreateAuditLogDto): Promise<AuditLog> {
		const result = await query<ResultSetHeader>(
			`INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
			[
				data.user_id,
				data.action,
				data.entity_type,
				data.entity_id,
				data.details ? JSON.stringify(data.details) : null,
				data.ip_address || null,
			]
		);

		const rows = await query<RowDataPacket[]>(
			"SELECT * FROM audit_logs WHERE id = ?",
			[result.insertId]
		);
		return rows[0] as AuditLog;
	}

	// Get audit logs for an entity
	async findByEntity(
		entityType: string,
		entityId: number
	): Promise<AuditLog[]> {
		const rows = await query<RowDataPacket[]>(
			`SELECT al.*, u.name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.entity_type = ? AND al.entity_id = ?
       ORDER BY al.timestamp DESC`,
			[entityType, entityId]
		);
		return rows as AuditLog[];
	}

	// Get all audit logs (admin view)
	async findAll(limit: number = 100): Promise<AuditLog[]> {
		const rows = await query<RowDataPacket[]>(
			`SELECT al.*, u.name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.timestamp DESC
       LIMIT ?`,
			[limit]
		);
		return rows as AuditLog[];
	}

	// Get logs by user
	async findByUserId(userId: number, limit: number = 50): Promise<AuditLog[]> {
		const rows = await query<RowDataPacket[]>(
			`SELECT * FROM audit_logs 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
			[userId, limit]
		);
		return rows as AuditLog[];
	}
}
