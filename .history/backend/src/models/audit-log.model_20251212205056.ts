// Audit log for tracking critical actions
export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: 'Complaint' | 'User' | 'Staff' | 'Feedback' | 'Notification';
  entity_id: number;
  details: object | null;
  ip_address: string | null;
  timestamp: Date;
}

export interface CreateAuditLogDto {
  user_id: number;
  action: string;
  entity_type: AuditLog['entity_type'];
  entity_id: number;
  details?: object;
  ip_address?: string;
}
