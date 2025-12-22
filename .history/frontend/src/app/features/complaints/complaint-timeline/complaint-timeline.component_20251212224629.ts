import { Component, Input, OnInit } from "@angular/core";
import { ComplaintService } from "@core/services/complaint.service";
import { StatusHistory } from "@core/models";

@Component({
	selector: "app-complaint-timeline",
	template: `
		<mat-card class="timeline-card">
			<mat-card-header>
				<mat-card-title>Status History</mat-card-title>
			</mat-card-header>
			<mat-card-content>
				<app-loading-spinner
					*ngIf="isLoading"
					[size]="24"
				></app-loading-spinner>

				<div class="timeline" *ngIf="!isLoading">
					<app-empty-state
						*ngIf="history.length === 0"
						icon="history"
						title="No history yet"
						message="Status changes will appear here"
					></app-empty-state>

					<div
						class="timeline-item"
						*ngFor="let item of history; let first = first"
					>
						<div class="timeline-marker" [class.first]="first">
							<div class="marker-dot"></div>
							<div class="marker-line" *ngIf="!first"></div>
						</div>
						<div class="timeline-content">
							<div class="timeline-header">
								<span class="status-change">
									<span class="old-status" *ngIf="item.old_status">
										{{ item.old_status | titlecase }}
									</span>
									<mat-icon *ngIf="item.old_status">arrow_forward</mat-icon>
									<span
										class="new-status"
										[class]="'status-' + item.new_status"
									>
										{{ item.new_status | titlecase }}
									</span>
								</span>
								<span class="timestamp">{{ item.created_at | timeAgo }}</span>
							</div>
							<div class="changed-by">
								<mat-icon>person</mat-icon>
								<span>{{ item.changed_by_name || "System" }}</span>
							</div>
							<div class="notes" *ngIf="item.notes">
								<p>{{ item.notes }}</p>
							</div>
						</div>
					</div>
				</div>
			</mat-card-content>
		</mat-card>
	`,
	styles: [
		`
			.timeline-card mat-card-header {
				padding: 16px 16px 0;
			}

			.timeline-card mat-card-content {
				padding: 16px;
			}

			.timeline {
				display: flex;
				flex-direction: column;
			}

			.timeline-item {
				display: flex;
				gap: 16px;
				min-height: 80px;
			}

			.timeline-item:last-child {
				min-height: auto;
			}

			.timeline-marker {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 20px;
			}

			.marker-dot {
				width: 12px;
				height: 12px;
				border-radius: 50%;
				background-color: var(--primary-color);
				border: 2px solid var(--bg-card);
				box-shadow: 0 0 0 2px var(--primary-color);
				z-index: 1;
			}

			.timeline-marker.first .marker-dot {
				width: 16px;
				height: 16px;
				background-color: var(--accent-color);
				box-shadow: 0 0 0 2px var(--accent-color);
			}

			.marker-line {
				width: 2px;
				flex: 1;
				background-color: var(--border-color);
				margin-top: 4px;
			}

			.timeline-content {
				flex: 1;
				padding-bottom: 16px;
			}

			.timeline-item:last-child .timeline-content {
				padding-bottom: 0;
			}

			.timeline-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 8px;
				flex-wrap: wrap;
				gap: 8px;
			}

			.status-change {
				display: flex;
				align-items: center;
				gap: 8px;
				font-weight: 500;
			}

			.status-change mat-icon {
				font-size: 16px;
				width: 16px;
				height: 16px;
				color: var(--text-secondary);
			}

			.old-status {
				color: var(--text-secondary);
				text-decoration: line-through;
			}

			.new-status {
				padding: 2px 8px;
				border-radius: 4px;
				font-size: 0.75rem;
				text-transform: uppercase;
			}

			.status-pending {
				background-color: rgba(158, 158, 158, 0.15);
				color: #9e9e9e;
			}

			.status-in_progress {
				background-color: rgba(33, 150, 243, 0.15);
				color: #2196f3;
			}

			.status-resolved {
				background-color: rgba(76, 175, 80, 0.15);
				color: #4caf50;
			}

			.status-rejected {
				background-color: rgba(244, 67, 54, 0.15);
				color: #f44336;
			}

			.status-escalated {
				background-color: rgba(255, 152, 0, 0.15);
				color: #ff9800;
			}

			.status-closed {
				background-color: rgba(63, 81, 181, 0.15);
				color: #3f51b5;
			}

			.timestamp {
				font-size: 0.75rem;
				color: var(--text-secondary);
			}

			.changed-by {
				display: flex;
				align-items: center;
				gap: 4px;
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			.changed-by mat-icon {
				font-size: 14px;
				width: 14px;
				height: 14px;
			}

			.notes {
				margin-top: 8px;
				padding: 8px 12px;
				background-color: rgba(0, 0, 0, 0.03);
				border-radius: 4px;
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			:host-context(.dark-theme) .notes {
				background-color: rgba(255, 255, 255, 0.05);
			}

			.notes p {
				margin: 0;
			}
		`,
	],
})
export class ComplaintTimelineComponent implements OnInit {
	@Input() complaintId!: string;

	history: StatusHistory[] = [];
	isLoading = true;

	constructor(private complaintService: ComplaintService) {}

	ngOnInit(): void {
		this.loadHistory();
	}

	private loadHistory(): void {
		this.complaintService.getStatusHistory(this.complaintId).subscribe({
			next: (history) => {
				this.history = history.sort(
					(a, b) =>
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				);
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}
}
