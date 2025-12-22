import { ComplaintCategory, Priority, ComplaintStatus } from "./types";

export interface Complaint {
	id: number;
	user_id: number;
	assigned_to: number | null;
	title: string;
	description: string;
	category: ComplaintCategory;
	priority: Priority;
	location: string;
	status: ComplaintStatus;
	sla_deadline: Date;
	is_overdue: boolean;
	is_escalated: boolean;
	is_recurring: boolean;
	attachments: string; // JSON array of file paths
	created_at: Date;
	updated_at: Date;
	resolved_at: Date | null;
}

// Create complaint payload
export interface CreateComplaintDto {
	title: string;
	description: string;
	category: ComplaintCategory;
	priority: Priority;
	location: string;
	attachments?: string[];
}

// Update complaint payload
export interface UpdateComplaintDto {
	title?: string;
	description?: string;
	category?: ComplaintCategory;
	priority?: Priority;
	location?: string;
	status?: ComplaintStatus;
	assigned_to?: number;
	notes?: string; // For status updates
	is_escalated?: boolean;
	is_recurring?: boolean;
}

// Response with joined user/staff info
export interface ComplaintResponse extends Omit<Complaint, "attachments"> {
	attachments: string[];
	user_name: string;
	user_email: string;
	assigned_staff_name: string | null;
	staff_email: string | null;
}

// Filter params for listing complaints
export interface ComplaintFilters {
	status?: ComplaintStatus | ComplaintStatus[];
	category?: ComplaintCategory;
	priority?: Priority;
	staff_id?: number;
	assigned_to?: number | string | null;
	user_id?: number;
	is_overdue?: boolean;
	is_escalated?: boolean;
	is_recurring?: boolean;
	search?: string;
	date_from?: Date;
	date_to?: Date;
	sort_by?: "created_at" | "updated_at" | "priority" | "sla_deadline";
	sort_order?: "asc" | "desc";
	page?: number;
	limit?: number;
}

// Pagination metadata
export interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// Pagination response - supports both flat and nested formats
export interface PaginatedResponse<T> {
	data: T[];
	pagination: PaginationMeta;
}

// Duplicate check result
export interface DuplicateCheckResult {
	hasDuplicates: boolean;
	duplicates: Complaint[];
}
