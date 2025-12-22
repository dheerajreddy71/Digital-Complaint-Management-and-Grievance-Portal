// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  availability_status?: AvailabilityStatus;
  expertise?: string[];
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  USER = 'user',
  STAFF = 'staff',
  ADMIN = 'admin',
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
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
  user_id: string;
  user_name?: string;
  user_email?: string;
  assigned_to?: string;
  assigned_staff_name?: string;
  category: ComplaintCategory;
  priority: Priority;
  status: ComplaintStatus;
  title: string;
  description: string;
  attachment_url?: string;
  resolution_notes?: string;
  sla_deadline: string;
  is_overdue: boolean;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export enum ComplaintCategory {
  BILLING = 'billing',
  TECHNICAL = 'technical',
  SERVICE = 'service',
  GENERAL = 'general',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ComplaintStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
}

export interface CreateComplaintRequest {
  category: ComplaintCategory;
  priority: Priority;
  title: string;
  description: string;
  attachment?: File;
}

export interface UpdateComplaintRequest {
  status?: ComplaintStatus;
  priority?: Priority;
  resolution_notes?: string;
}

export interface ComplaintFilters {
  status?: ComplaintStatus;
  priority?: Priority;
  category?: ComplaintCategory;
  assigned_to?: string;
  user_id?: string;
  is_overdue?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
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
  potentialDuplicates: Complaint[];
}

// Status History
export interface StatusHistory {
  id: string;
  complaint_id: string;
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
  COMPLAINT_CREATED = 'complaint_created',
  COMPLAINT_ASSIGNED = 'complaint_assigned',
  STATUS_UPDATED = 'status_updated',
  COMMENT_ADDED = 'comment_added',
  SLA_WARNING = 'sla_warning',
  SLA_BREACH = 'sla_breach',
  FEEDBACK_RECEIVED = 'feedback_received',
  ESCALATION = 'escalation',
}

// Comment
export interface Comment {
  id: string;
  complaint_id: string;
  user_id: string;
  user_name?: string;
  user_role?: UserRole;
  content: string;
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
