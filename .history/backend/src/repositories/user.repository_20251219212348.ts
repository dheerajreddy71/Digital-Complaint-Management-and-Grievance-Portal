import { query, getConnection } from "../config/database";
import { User, CreateUserDto, UserResponse } from "../models";
import bcrypt from "bcryptjs";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class UserRepository {
	// Find user by email - used for login
	async findByEmail(email: string): Promise<User | null> {
		const rows = await query<RowDataPacket[]>(
			"SELECT * FROM users WHERE email = ? AND is_active = TRUE",
			[email]
		);
		return rows.length > 0 ? (rows[0] as User) : null;
	}

	// Find user by ID
	async findById(id: number): Promise<User | null> {
		const rows = await query<RowDataPacket[]>(
			"SELECT * FROM users WHERE id = ?",
			[id]
		);
		return rows.length > 0 ? (rows[0] as User) : null;
	}

	// Create new user with hashed password
	async create(data: CreateUserDto): Promise<UserResponse> {
		const hashedPassword = await bcrypt.hash(data.password, 10);

		const result = await query<ResultSetHeader>(
			`INSERT INTO users (name, email, password_hash, role, contact_info, expertise)
       VALUES (?, ?, ?, ?, ?, ?)`,
			[
				data.name,
				data.email,
				hashedPassword,
				data.role,
				data.contact_info || null,
				data.expertise || null,
			]
		);

		const user = await this.findById(result.insertId);
		return this.toResponse(user!);
	}

	// Get all staff members (for assignment)
	async findAllStaff(): Promise<UserResponse[]> {
		const rows = await query<RowDataPacket[]>(
			`SELECT * FROM users WHERE role = 'Staff' AND is_active = TRUE
       ORDER BY name`
		);
		return rows.map((row) => this.toResponse(row as User));
	}

	// Get staff by expertise (for auto-assignment)
	async findStaffByExpertise(expertise: string): Promise<UserResponse[]> {
		const rows = await query<RowDataPacket[]>(
			`SELECT * FROM users 
       WHERE role = 'Staff' AND is_active = TRUE 
       AND availability_status = 'available'
       AND expertise LIKE ?
       ORDER BY name`,
			[`%${expertise}%`]
		);
		return rows.map((row) => this.toResponse(row as User));
	}

	// Get staff with workload info (for smart assignment)
	async getStaffWithWorkload(): Promise<
		(UserResponse & { active_complaints: number })[]
	> {
		const rows = await query<RowDataPacket[]>(
			`SELECT u.*, 
              COUNT(c.id) as active_complaints
       FROM users u
       LEFT JOIN complaints c ON u.id = c.assigned_to AND c.status != 'Resolved'
       WHERE u.role = 'Staff' AND u.is_active = TRUE AND u.availability_status = 'available'
       GROUP BY u.id
       ORDER BY active_complaints ASC`
		);
		return rows.map((row) => ({
			...this.toResponse(row as User),
			active_complaints: (row as any).active_complaints,
		}));
	}

	// Update user availability status
	async updateAvailability(
		userId: number,
		status: "Available" | "OnLeave" | "Busy"
	): Promise<void> {
		await query("UPDATE users SET availability_status = ? WHERE id = ?", [
			status,
			userId,
		]);
	}

	// Update user profile
	async update(id: number, data: Partial<User>): Promise<UserResponse | null> {
		const fields: string[] = [];
		const values: unknown[] = [];

		if (data.name) {
			fields.push("name = ?");
			values.push(data.name);
		}
		if (data.contact_info) {
			fields.push("contact_info = ?");
			values.push(data.contact_info);
		}
		if (data.expertise) {
			fields.push("expertise = ?");
			values.push(data.expertise);
		}
		if (data.availability_status) {
			fields.push("availability_status = ?");
			values.push(data.availability_status);
		}

		if (fields.length === 0) return null;

		values.push(id);
		await query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

		const user = await this.findById(id);
		return user ? this.toResponse(user) : null;
	}

	// Deactivate user (soft delete)
	async deactivate(id: number): Promise<void> {
		await query("UPDATE users SET is_active = FALSE WHERE id = ?", [id]);
	}

	// Get all users (admin only)
	async findAll(): Promise<UserResponse[]> {
		const rows = await query<RowDataPacket[]>(
			"SELECT * FROM users ORDER BY created_at DESC"
		);
		return rows.map((row) => this.toResponse(row as User));
	}

	// Check if email exists
	async emailExists(email: string): Promise<boolean> {
		const rows = await query<RowDataPacket[]>(
			"SELECT id FROM users WHERE email = ?",
			[email]
		);
		return rows.length > 0;
	}

	// Strip password from user object for responses
	private toResponse(user: User): UserResponse {
		const { password_hash, password, updated_at, last_login, ...response } =
			user as any;
		return response;
	}
}
