import { Component, Input, OnInit } from "@angular/core";

interface TimelineEvent {
	id: number;
	action: string;
	timestamp: string;
	user_name: string;
	user_role: string;
	details?: any;
	icon: string;
	color: string;
	duration?: string; // Time spent in this status
}

@Component({
	selector: "app-complaint-timeline",
	template: `
		<div class="timeline-container">
			<h3 class="timeline-header">
				<mat-icon>history</mat-icon>
				Activity Timeline
			</h3>

			<div class="timeline" *ngIf="events.length > 0">
				<div
					*ngFor="let event of events; let last = last; let i = index"
					class="timeline-item"
					[class.last]="last"
				>
					<div class="timeline-dot" [style.background-color]="event.color">
						<mat-icon>{{ event.icon }}</mat-icon>
					</div>

					<div class="timeline-content">
						<div class="event-header">
							<span class="event-action">{{ event.action }}</span>
							<div class="event-timing">
								<span class="event-time">{{
									formatTime(event.timestamp)
								}}</span>
								<span class="event-duration" *ngIf="event.duration">
									<mat-icon>timer</mat-icon>
									{{ event.duration }}
								</span>
							</div>
						</div>

						<div class="event-user">
							<mat-icon class="user-icon">person</mat-icon>
							<span class="user-name">{{ event.user_name }}</span>
							<mat-chip
								class="user-role"
								[style.background]="getRoleColor(event.user_role)"
							>
								{{ event.user_role }}
							</mat-chip>
						</div>

						<div class="event-details" *ngIf="event.details">
							<div
								*ngFor="let detail of getDetails(event.details)"
								class="detail-item"
							>
								<strong>{{ detail.label }}:</strong> {{ detail.value }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="timeline-empty" *ngIf="events.length === 0">
				<mat-icon>event_busy</mat-icon>
				<p>No activity history available</p>
			</div>
		</div>
	`,
	styles: [
		`
			.timeline-container {
				padding: 16px;
				background: #fafafa;
				border-radius: 8px;
			}

			.timeline-header {
				display: flex;
				align-items: center;
				gap: 8px;
				margin: 0 0 24px 0;
				font-size: 1.125rem;
				font-weight: 600;
				color: #333;
			}

			.timeline-header mat-icon {
				color: #1976d2;
			}

			.timeline {
				position: relative;
				padding-left: 40px;
			}

			.timeline::before {
				content: "";
				position: absolute;
				left: 19px;
				top: 0;
				bottom: 0;
				width: 2px;
				background: linear-gradient(to bottom, #e0e0e0 0%, transparent 100%);
			}

			.timeline-item {
				position: relative;
				padding-bottom: 32px;
			}

			.timeline-item.last {
				padding-bottom: 0;
			}

			.timeline-dot {
				position: absolute;
				left: -40px;
				top: 0;
				width: 40px;
				height: 40px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 3px solid #fff;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
				z-index: 1;
			}

			.timeline-dot mat-icon {
				color: #fff;
				font-size: 20px;
				width: 20px;
				height: 20px;
			}

			.timeline-content {
				background: #fff;
				padding: 16px;
				border-radius: 8px;
				box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
				transition: box-shadow 0.3s ease;
			}

			.timeline-content:hover {
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
			}

			.event-header {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 8px;
				flex-wrap: wrap;
				gap: 8px;
			}

			.event-action {
				font-weight: 600;
				font-size: 1rem;
				color: #333;
			}

			.event-timing {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				gap: 4px;
			}

			.event-time {
				font-size: 0.875rem;
				color: #666;
			}

			.event-duration {
				display: flex;
				align-items: center;
				gap: 4px;
				font-size: 0.75rem;
				color: #1976d2;
				background: rgba(25, 118, 210, 0.1);
				padding: 2px 8px;
				border-radius: 12px;
			}

			.event-duration mat-icon {
				font-size: 12px;
				width: 12px;
				height: 12px;
			}

			.event-user {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 12px;
			}

			.user-icon {
				font-size: 18px;
				width: 18px;
				height: 18px;
				color: #757575;
			}

			.user-name {
				font-size: 0.875rem;
				color: #555;
			}

			.user-role {
				font-size: 0.75rem;
				padding: 2px 8px;
				height: 20px;
				color: #fff;
				border-radius: 12px;
			}

			.event-details {
				background: #f5f5f5;
				padding: 12px;
				border-radius: 6px;
				border-left: 3px solid #1976d2;
			}

			.detail-item {
				font-size: 0.875rem;
				color: #555;
				margin-bottom: 4px;
			}

			.detail-item:last-child {
				margin-bottom: 0;
			}

			.timeline-empty {
				text-align: center;
				padding: 40px;
				color: #999;
			}

			.timeline-empty mat-icon {
				font-size: 48px;
				width: 48px;
				height: 48px;
				margin-bottom: 16px;
			}

			@media (max-width: 768px) {
				.timeline-container {
					padding: 12px;
				}

				.timeline {
					padding-left: 30px;
				}

				.timeline::before {
					left: 14px;
				}

				.timeline-dot {
					left: -30px;
					width: 30px;
					height: 30px;
				}

				.timeline-dot mat-icon {
					font-size: 16px;
					width: 16px;
					height: 16px;
				}

				.timeline-content {
					padding: 12px;
				}

				.event-header {
					flex-direction: column;
					align-items: flex-start;
					gap: 4px;
				}
			}
		`,
	],
})
export class ComplaintTimelineComponent implements OnInit {
	@Input() complaintId!: number;
	@Input() statusHistory: any[] = [];
	@Input() comments: any[] = [];

	events: TimelineEvent[] = [];

	ngOnInit(): void {
		this.buildTimeline();
	}

	private buildTimeline(): void {
		const allEvents: TimelineEvent[] = [];

		// Sort status history by timestamp (oldest first for duration calculation)
		const sortedHistory = [...this.statusHistory].sort(
			(a, b) =>
				new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
		);

		// Add status history events with duration calculation
		sortedHistory.forEach((history, index) => {
			let duration: string | undefined;

			// Calculate duration from this status to the next
			if (index < sortedHistory.length - 1) {
				const currentTime = new Date(history.changed_at).getTime();
				const nextTime = new Date(
					sortedHistory[index + 1].changed_at
				).getTime();
				duration = this.formatDuration(nextTime - currentTime);
			}

			allEvents.push({
				id: history.id,
				action: this.getStatusActionText(history.new_status),
				timestamp: history.changed_at,
				user_name: history.changed_by_name || "System",
				user_role: this.getUserRole(history.changed_by_name),
				details: {
					old_status: history.old_status,
					new_status: history.new_status,
					notes: history.notes,
				},
				icon: this.getStatusIcon(history.new_status),
				color: this.getStatusColor(history.new_status),
				duration: duration,
			});
		});

		// Add comment events
		this.comments.forEach((comment) => {
			allEvents.push({
				id: comment.id,
				action: "Added Comment",
				timestamp: comment.created_at,
				user_name: comment.user_name || "Unknown",
				user_role: this.getUserRole(comment.user_name),
				details: {
					comment: comment.content,
				},
				icon: "comment",
				color: "#9c27b0",
			});
		});

		// Sort by timestamp (newest first)
		this.events = allEvents.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);
	}

	private formatDuration(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) {
			const remainingHours = hours % 24;
			return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
		}
		if (hours > 0) {
			const remainingMinutes = minutes % 60;
			return remainingMinutes > 0
				? `${hours}h ${remainingMinutes}m`
				: `${hours}h`;
		}
		if (minutes > 0) {
			return `${minutes}m`;
		}
		return "< 1m";
	}

	private getStatusActionText(status: string): string {
		const actions: { [key: string]: string } = {
			Open: "Complaint Created",
			Assigned: "Complaint Assigned",
			"In Progress": "Work Started",
			Resolved: "Complaint Resolved",
			Closed: "Complaint Closed",
		};
		return actions[status] || `Status Changed to ${status}`;
	}

	private getStatusIcon(status: string): string {
		const icons: { [key: string]: string } = {
			Open: "add_circle",
			Assigned: "assignment_ind",
			"In Progress": "work",
			Resolved: "check_circle",
			Closed: "done_all",
		};
		return icons[status] || "update";
	}

	private getStatusColor(status: string): string {
		const colors: { [key: string]: string } = {
			Open: "#2196f3",
			Assigned: "#ff9800",
			"In Progress": "#9c27b0",
			Resolved: "#4caf50",
			Closed: "#607d8b",
		};
		return colors[status] || "#757575";
	}

	private getUserRole(userName: string): string {
		// This is a simplified role detection
		// In a real app, you'd get this from user data
		if (!userName || userName === "System") return "System";
		if (userName.includes("Admin")) return "Admin";
		if (userName.includes("Staff")) return "Staff";
		return "Citizen";
	}

	private getRoleColor(role: string): string {
		const colors: { [key: string]: string } = {
			Admin: "#d32f2f",
			Staff: "#1976d2",
			Citizen: "#388e3c",
			System: "#757575",
		};
		return colors[role] || "#757575";
	}

	formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
		if (diffHours < 24)
			return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
		if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	getDetails(details: any): Array<{ label: string; value: string }> {
		const result: Array<{ label: string; value: string }> = [];

		if (details.old_status && details.new_status) {
			result.push({
				label: "Status Change",
				value: `${details.old_status} → ${details.new_status}`,
			});
		}

		if (details.notes) {
			result.push({
				label: "Notes",
				value: details.notes,
			});
		}

		if (details.comment) {
			result.push({
				label: "Comment",
				value: details.comment,
			});
		}

		return result;
	}
}
