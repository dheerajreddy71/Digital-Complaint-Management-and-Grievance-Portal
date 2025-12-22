import { ComplaintStatus } from './types';

// Tracks all status changes for complaint timeline
export interface StatusHistory {
  id: number;
  complaint_id: number;
  previous_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  updated_by: number;
  notes: string | null;
  timestamp: Date;
}

// Response with user info for timeline display
export interface StatusHistoryResponse extends StatusHistory {
  updated_by_name: string;
  updated_by_role: string;
}

// Create status history entry
export interface CreateStatusHistoryDto {
  complaint_id: number;
  previous_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  updated_by: number;
  notes?: string;
}
