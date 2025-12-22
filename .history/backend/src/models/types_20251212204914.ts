// User roles as specified in the requirements
export type UserRole = 'User' | 'Staff' | 'Admin';

// Complaint categories
export type ComplaintCategory = 'Plumbing' | 'Electrical' | 'Facility' | 'IT' | 'Other';

// Priority levels with corresponding SLA hours
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

// Complaint lifecycle statuses - must follow: Open → Assigned → In-progress → Resolved
export type ComplaintStatus = 'Open' | 'Assigned' | 'In-progress' | 'Resolved';

// Notification types for the in-app notification system
export type NotificationType = 'Assigned' | 'StatusUpdate' | 'Resolved' | 'Reminder' | 'SLABreach' | 'FeedbackRequest';

// Staff availability status
export type AvailabilityStatus = 'Available' | 'OnLeave' | 'Busy';

// SLA hours by priority - Critical: 4h, High: 12h, Medium: 24h, Low: 48h
export const SLA_HOURS: Record<Priority, number> = {
  Critical: 4,
  High: 12,
  Medium: 24,
  Low: 48
};

// Allowed file types for attachments
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
