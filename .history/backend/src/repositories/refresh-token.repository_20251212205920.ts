import { query } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// Stores refresh tokens for JWT refresh token implementation
export class RefreshTokenRepository {
  // Save refresh token
  async save(userId: number, token: string, expiresAt: Date): Promise<void> {
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [userId, token, expiresAt]
    );
  }

  // Find token
  async findByToken(token: string): Promise<{ user_id: number; expires_at: Date } | null> {
    const rows = await query<RowDataPacket[]>(
      'SELECT user_id, expires_at FROM refresh_tokens WHERE token = ?',
      [token]
    );
    return rows.length > 0 ? (rows[0] as { user_id: number; expires_at: Date }) : null;
  }

  // Delete token (logout)
  async delete(token: string): Promise<void> {
    await query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
  }

  // Delete all tokens for user (logout all devices)
  async deleteAllForUser(userId: number): Promise<void> {
    await query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
  }

  // Cleanup expired tokens (scheduled job)
  async deleteExpired(): Promise<number> {
    const result = await query<ResultSetHeader>(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );
    return result.affectedRows;
  }
}
