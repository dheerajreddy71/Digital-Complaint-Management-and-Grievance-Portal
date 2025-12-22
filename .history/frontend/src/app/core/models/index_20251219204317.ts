// User related types
export interface User {
	id: number | string;
	email: string;
	name: string;
	contact_info?: string;
	role: UserRole;
	availability_status?: AvailabilityStatus;
	expertise?: string;
	is_active?: boolean;
	created_at: string;
}

export enum UserRole {
	CITIZEN = "User",
	STAFF = "Staff",
	ADMIN = "Admin",
}

export enum AvailabilityStatus {
	AVAILABLE = "available",
	BUSY = "busy",
	OFFLINE = "offline",
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
	phone: string;
}

export interface AuthResponse {
	user: User;
	accessToken: string;
	refreshToken: string;
}

export interface TokenPayload {
	userId: string;
	email: string;
	role: UserRole;
	exp: number;
	iat: number;
}

// Complaint related types
export interface Complaint {
	id: string;
	tracking_id?: string;
	user_id: string;
	citizen_id?: string;
	user_name?: string;
	user_email?: string;
	assigned_to?: string;
	assigned_staff_name?: string;
	category: ComplaintCategory;
	priority: Priority;
	status: ComplaintStatus;
	title: string;
	description: string;
	location?: string;
	attachments?: string[];
	attachment_url?: string;
	resolution_notes?: string;
	sla_deadline: string;
	is_overdue: boolean;
	is_recurring?: boolean;
	feedback_rating?: number;
	created_at: string;
	updated_at: string;
	resolved_at?: string;
}

export enum ComplaintCategory {
	PLUMBING = "Plumbing",
	ELECTRICAL = "Electrical",
	FACILITY = "Facility",
	IT = "IT",
	OTHER = "Other",
}

export enum Priority {
	LOW = "Low",
	MEDIUM = "Medium",
	HIGH = "High",
	CRITICAL = "Critical",
}

export enum ComplaintStatus {
	OPEN = "Open",
	ASSIGNED = "Assigned",
	IN_PROGRESS = "In-progress",
	RESOLVED = "Resolved",
}

export interface CreateComplaintRequest {
	category: ComplaintCategory;
	priority: Priority;
	title: string;
	description: string;
	location: string;
	attachment?: File;
}

export interface UpdateComplaintRequest {
	status?: ComplaintStatus;
	priority?: Priority;
	resolution_notes?: string;
}

export interface ComplaintFilters {
	status?: ComplaintStatus | string;
	priority?: Priority;
	category?: ComplaintCategory;
	assigned_to?: string | number;
	user_id?: string | number;
	is_overdue?: boolean;
	resolved_after?: string;
	search?: string;
	sort_by?: string;
	sort_order?: "asc" | "desc";
	page?: number;
	limit?: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	complaints?: T[];
	total?: number;
	notifications?: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface ComplaintSuggestion {
	suggestedCategory: ComplaintCategory;
	suggestedPriority: Priority;
	categoryConfidence: number;
	priorityConfidence: number;
}

export interface DuplicateCheckResult {
	hasDuplicates: boolean;
	potentialDuplicates?: Complaint[];
	possibleDuplicates?: Complaint[];
}

// Status History
export interface StatusHistory {
	id: string;
	complaint_id: string;
	from_status?: ComplaintStatus;
	to_status?: ComplaintStatus;
	old_status?: ComplaintStatus;
	new_status: ComplaintStatus;
	changed_by: string;
	changed_by_name?: string;
	notes?: string;
	created_at: string;
}

// Feedback
export interface Feedback {
	id: string;
	complaint_id: string;
	user_id: string;
	staff_id: string;
	rating: number;
	comments?: string;
	created_at: string;
}

export interface CreateFeedbackRequest {
	complaint_id: string;
	rating: number;
	comments?: string;
}

export interface StaffPerformanceMetrics {
	staff_id: string;
	staff_name: string;
	total_resolved: number;
	average_rating: number;
	average_resolution_hours: number;
}

// Notification
export interface Notification {
	id: string;
	user_id: string;
	type: NotificationType;
	title: string;
	message: string;
	complaint_id?: string;
	is_read: boolean;
	created_at: string;
}

export enum NotificationType {
	COMPLAINT_CREATED = "complaint_created",
	COMPLAINT_ASSIGNED = "complaint_assigned",
	STATUS_UPDATED = "status_updated",
	COMMENT_ADDED = "comment_added",
	SLA_WARNING = "sla_warning",
	SLA_BREACH = "sla_breach",
	FEEDBACK_RECEIVED = "feedback_received",
	ESCALATION = "escalation",
}

// Comment
export interface Comment {
	id: string;
	complaint_id: string;
	user_id: string;
	author_id?: string;
	user_name?: string;
	user_role?: UserRole;
	content: string;
	comment?: string;
	is_internal?: boolean;
	created_at: string;
}

export interface CreateCommentRequest {
	complaint_id: string;
	content: string;
}

// Analytics
export interface AnalyticsData {
	overview: {
		total_complaints: number;
		pending_complaints: number;
		resolved_complaints: number;
		overdue_complaints: number;
		average_resolution_hours: number;
		sla_compliance_rate: number;
	};
	by_category: { category: ComplaintCategory; count: number }[];
	by_priority: { priority: Priority; count: number }[];
	by_status: { status: ComplaintStatus; count: number }[];
	trends: { date: string; count: number }[];
	staff_performance: StaffPerformanceMetrics[];
}

// API Response types
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

export interface ApiError {
	message: string;
	errors?: { [key: string]: string[] };
}

// Staff workload
export interface StaffWorkload {
	staff_id: string;
	staff_name: string;
	email: string;
	availability_status: AvailabilityStatus;
	expertise: string[];
	active_complaints: number;
	resolved_this_month: number;
	average_rating: number;
}

// Analytics type alias
export type Analytics = AnalyticsData;

// Staff Performance
export interface StaffPerformance {
	staff_id: string | number;
	staff_name: string;
	total_assigned: number;
	resolved_count: number;
	in_progress_count: number;
	overdue_count: number;
	avg_rating: number;
	sla_compliance_rate: number;
	average_resolution_hours?: number;
}

// Audit Log
export interface AuditLog {
	id: string;
	user_id?: string;
	user_name?: string;
	action: string;
	entity_type: string;
	entity_id?: string;
	old_values?: any;
	new_values?: any;
	ip_address?: string;
	user_agent?: string;
	created_at: string;
}
