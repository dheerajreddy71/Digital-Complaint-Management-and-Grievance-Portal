import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ComplaintService } from "@core/services/complaint.service";
import { AuthService } from "@core/services/auth.service";
import { SnackbarService } from "@core/services/snackbar.service";
import { Complaint, ComplaintStatus, Priority } from "@core/models";

@Component({
	selector: "app-staff-queue",
	template: `
		<div class="page-container">
			<div class="page-header fade-in">
				<h1>Complaint Queue</h1>
				<p class="subtitle">Unassigned complaints (Open, Assigned, In-progress) waiting to be picked up</p>
			</div>

			<!-- Filters -->
			<mat-card class="filters-card fade-in">
				<div class="filters-row">
					<mat-form-field appearance="outline" class="filter-field">
						<mat-label>Priority</mat-label>
						<mat-select
							[(ngModel)]="priorityFilter"
							(selectionChange)="loadQueue()"
						>
							<mat-option value="">All Priorities</mat-option>
							<mat-option value="critical">Critical</mat-option>
							<mat-option value="high">High</mat-option>
							<mat-option value="medium">Medium</mat-option>
							<mat-option value="low">Low</mat-option>
						</mat-select>
					</mat-form-field>

					<mat-form-field appearance="outline" class="filter-field">
						<mat-label>Category</mat-label>
						<mat-select
							[(ngModel)]="categoryFilter"
							(selectionChange)="loadQueue()"
						>
							<mat-option value="">All Categories</mat-option>
							<mat-option value="service_delay">Service Delay</mat-option>
							<mat-option value="staff_behavior">Staff Behavior</mat-option>
							<mat-option value="technical_issue">Technical Issue</mat-option>
							<mat-option value="billing">Billing</mat-option>
							<mat-option value="facility">Facility</mat-option>
							<mat-option value="other">Other</mat-option>
						</mat-select>
					</mat-form-field>

					<mat-checkbox [(ngModel)]="showOverdueOnly" (change)="loadQueue()">
						Overdue only
					</mat-checkbox>
				</div>
			</mat-card>

			<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

			<!-- Queue List -->
			<div class="queue-list" *ngIf="!isLoading">
				<app-empty-state
					*ngIf="complaints.length === 0 && hasActiveFilters"
					icon="filter_list_off"
					title="No matching complaints"
					message="Try adjusting your filters to see more complaints"
				></app-empty-state>
				<app-empty-state
					*ngIf="complaints.length === 0 && !hasActiveFilters"
					icon="celebration"
					title="All caught up! 🎉"
					message="No unassigned complaints in your department queue. Great job!"
				></app-empty-state>

				<mat-card
					*ngFor="let complaint of complaints"
					class="queue-item fade-in"
					[class.overdue]="complaint.is_overdue"
					[class.critical]="complaint.priority === 'Critical'"
				>
					<div class="queue-item-main" (click)="viewComplaint(complaint)">
						<div class="queue-item-header">
							<div class="badges">
								<app-priority-badge
									[priority]="complaint.priority"
								></app-priority-badge>
								<span class="category-chip">{{
									complaint.category | categoryLabel
								}}</span>
							</div>
							<app-sla-indicator
								[slaDeadline]="complaint.sla_deadline"
								[isOverdue]="complaint.is_overdue"
							></app-sla-indicator>
						</div>

						<h3 class="queue-item-title">{{ complaint.title }}</h3>

						<p class="queue-item-description">
							{{ complaint.description | truncate : 150 }}
						</p>

						<div class="queue-item-meta">
							<span><mat-icon>person</mat-icon> {{ complaint.user_name }}</span>
							<span
								><mat-icon>schedule</mat-icon>
								{{ complaint.created_at | timeAgo }}</span
							>
							<span *ngIf="complaint.is_recurring" class="recurring">
								<mat-icon>repeat</mat-icon> Recurring
							</span>
						</div>
					</div>

					<div class="queue-item-actions">
						<button
							mat-raised-button
							color="primary"
							(click)="pickUp(complaint); $event.stopPropagation()"
							[disabled]="isPickingUp === complaint.id"
						>
							<mat-spinner
								*ngIf="isPickingUp === complaint.id"
								diameter="18"
							></mat-spinner>
							<mat-icon *ngIf="isPickingUp !== complaint.id"
								>assignment_ind</mat-icon
							>
							<span>Pick Up</span>
						</button>
					</div>
				</mat-card>
			</div>

			<!-- Pagination -->
			<mat-paginator
				*ngIf="totalCount > pageSize"
				[length]="totalCount"
				[pageSize]="pageSize"
				[pageSizeOptions]="[10, 25, 50]"
				(page)="onPageChange($event)"
				class="fade-in"
			></mat-paginator>
		</div>
	`,
	styles: [
		`
			.page-header {
				margin-bottom: 24px;
			}

			.page-header h1 {
				margin: 0 0 4px;
			}

			.subtitle {
				margin: 0;
				color: var(--text-secondary);
			}

			.filters-card {
				margin-bottom: 24px;
				padding: 16px;
			}

			.filters-row {
				display: flex;
				gap: 16px;
				align-items: center;
				flex-wrap: wrap;
			}

			.filter-field {
				min-width: 180px;
			}

			.queue-list {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.queue-item {
				cursor: pointer;
				transition: all 0.2s ease;
				border-left: 4px solid transparent;
			}

			.queue-item:hover {
				box-shadow: var(--shadow-md);
				transform: translateY(-2px);
			}

			.queue-item.overdue {
				border-left-color: #f44336;
				background-color: rgba(244, 67, 54, 0.05);
			}

			.queue-item.critical {
				border-left-color: #9c27b0;
			}

			.queue-item mat-card-content {
				display: flex;
				gap: 24px;
				padding: 20px;
			}

			.queue-item-main {
				flex: 1;
				min-width: 0;
			}

			.queue-item-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 12px;
				flex-wrap: wrap;
				gap: 8px;
			}

			.badges {
				display: flex;
				gap: 8px;
				align-items: center;
				flex-wrap: wrap;
			}

			.category-chip {
				padding: 4px 8px;
				border-radius: 4px;
				background-color: rgba(0, 0, 0, 0.08);
				font-size: 0.75rem;
				font-weight: 500;
			}

			:host-context(.dark-theme) .category-chip {
				background-color: rgba(255, 255, 255, 0.12);
			}

			.queue-item-title {
				margin: 0 0 8px;
				font-size: 1.125rem;
			}

			.queue-item-description {
				margin: 0 0 12px;
				color: var(--text-secondary);
				line-height: 1.5;
			}

			.queue-item-meta {
				display: flex;
				gap: 16px;
				flex-wrap: wrap;
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			.queue-item-meta span {
				display: flex;
				align-items: center;
				gap: 4px;
			}

			.queue-item-meta mat-icon {
				font-size: 16px;
				width: 16px;
				height: 16px;
			}

			.queue-item-meta .recurring {
				color: #9c27b0;
			}

			.queue-item-actions {
				display: flex;
				align-items: center;
			}

			.queue-item-actions button {
				white-space: nowrap;
			}

			.queue-item-actions button mat-spinner {
				display: inline-block;
				margin-right: 8px;
			}

			mat-paginator {
				margin-top: 24px;
				background: transparent;
			}

			@media (max-width: 768px) {
				.filters-row {
					flex-direction: column;
					align-items: stretch;
				}

				.filter-field {
					width: 100%;
				}

				.queue-item mat-card-content {
					flex-direction: column;
				}

				.queue-item-actions {
					width: 100%;
				}

				.queue-item-actions button {
					width: 100%;
				}
			}
		`,
	],
})
export class StaffQueueComponent implements OnInit {
	complaints: Complaint[] = [];
	isLoading = true;
	isPickingUp: string | null = null;

	priorityFilter = "";
	categoryFilter = "";
	showOverdueOnly = false;

	page = 1;
	pageSize = 10;
	totalCount = 0;

	constructor(
		private router: Router,
		private complaintService: ComplaintService,
		private authService: AuthService,
		private snackbar: SnackbarService
	) {}

	ngOnInit(): void {
		this.loadQueue();
	}

	loadQueue(): void {
		this.isLoading = true;

		const filters: Record<string, string | number | boolean> = {
			// Show Open, Assigned, and In-progress statuses
			status: "Open,Assigned,In-progress",
			assigned_to: "null",
			page: this.page,
			limit: this.pageSize,
		};

		if (this.priorityFilter) {
			filters["priority"] = this.priorityFilter;
		}

		if (this.categoryFilter) {
			filters["category"] = this.categoryFilter;
		}

		if (this.showOverdueOnly) {
			filters["is_overdue"] = true;
		}

		this.complaintService.getComplaints(filters).subscribe({
			next: (response) => {
				this.complaints = response.data || [];
				this.totalCount = response.pagination?.total || 0;
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	pickUp(complaint: Complaint): void {
		const staffId = this.authService.currentUser?.id;
		if (!staffId) return;

		this.isPickingUp = complaint.id;

		this.complaintService.assignComplaint(complaint.id, staffId).subscribe({
			next: () => {
				this.complaints = this.complaints.filter((c) => c.id !== complaint.id);
				this.totalCount--;
				this.isPickingUp = null;
				this.snackbar.success("Complaint assigned to you");
				this.router.navigate(["/staff/assigned"]);
			},
			error: () => {
				this.isPickingUp = null;
			},
		});
	}

	viewComplaint(complaint: Complaint): void {
		this.router.navigate(["/complaints", complaint.id]);
	}

	onPageChange(event: { pageIndex: number; pageSize: number }): void {
		this.page = event.pageIndex + 1;
		this.pageSize = event.pageSize;
		this.loadQueue();
	}
}
