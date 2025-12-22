export interface Feedback {
	id: number;
	complaint_id: number;
	rating: number; // 1-5
	review: string | null;
	is_resolved: boolean; // Was the issue fully resolved?
	submitted_at: Date;
}

// Create feedback payload
export interface CreateFeedbackDto {
	complaint_id: number;
	rating: number;
	review?: string;
	is_resolved: boolean;
}

// Response with complaint info
export interface FeedbackResponse extends Feedback {
	complaint_title: string;
	user_id: number;
	user_name: string;
	staff_id: number | null;
	staff_name: string | null;
}

// Staff performance metrics derived from feedback
export interface StaffPerformanceMetrics {
	staff_id: number;
	staff_name: string;
	total_resolved: number;
	average_rating: number;
	total_feedbacks: number;
	sla_compliance_rate: number;
	average_resolution_time_hours: number;
}
