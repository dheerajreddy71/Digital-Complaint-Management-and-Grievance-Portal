import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { ComplaintService } from "@core/services/complaint.service";
import { AuthService } from "@core/services/auth.service";
import { UserService } from "@core/services/user.service";
import { SnackbarService } from "@core/services/snackbar.service";
import { Complaint, ComplaintStatus, AvailabilityStatus } from "@core/models";
import { ConfirmDialogComponent } from "@shared/components/confirm-dialog/confirm-dialog.component";

@Component({
	selector: "app-assigned-complaints",
	template: `
		<div class="page-container">
			<div class="page-header fade-in">
				<div class="header-left">
					<h1>My Assigned Complaints</h1>
					<p class="subtitle">Complaints currently assigned to you</p>
				</div>
				<div class="header-right">
					<div class="availability-toggle">
						<span>Availability:</span>
						<mat-slide-toggle
							[checked]="isAvailable"
							(change)="toggleAvailability($event.checked)"
							color="primary"
						>
							{{ isAvailable ? "Available" : "Not Available" }}
						</mat-slide-toggle>
					</div>
				</div>
			</div>

			<!-- Stats -->
			<div class="stats-row fade-in">
				<mat-card class="stat-card">
					<div class="stat-icon in-progress">
						<mat-icon>hourglass_empty</mat-icon>
					</div>
					<div class="stat-content">
						<span class="stat-value">{{ inProgressCount }}</span>
						<span class="stat-label">In Progress</span>
					</div>
				</mat-card>

				<mat-card class="stat-card">
					<div class="stat-icon overdue">
						<mat-icon>warning</mat-icon>
					</div>
					<div class="stat-content">
						<span class="stat-value">{{ overdueCount }}</span>
						<span class="stat-label">Overdue</span>
					</div>
				</mat-card>

				<mat-card class="stat-card">
					<div class="stat-icon resolved">
						<mat-icon>check_circle</mat-icon>
					</div>
					<div class="stat-content">
						<span class="stat-value">{{ resolvedTodayCount }}</span>
						<span class="stat-label">Resolved Today</span>
					</div>
				</mat-card>
			</div>

			<!-- Tabs -->
			<mat-tab-group
				[(selectedIndex)]="selectedTab"
				(selectedTabChange)="onTabChange()"
				class="fade-in"
			>
				<mat-tab>
					<ng-template mat-tab-label>
						<mat-icon>hourglass_empty</mat-icon>
						Active
						<span class="tab-count" *ngIf="activeComplaints.length > 0">
							{{ activeComplaints.length }}
						</span>
					</ng-template>

					<div class="tab-content">
						<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

						<app-empty-state
							*ngIf="!isLoading && activeComplaints.length === 0"
							icon="assignment_turned_in"
							title="No active complaints"
							message="You don't have any complaints in progress"
							buttonText="Browse Queue"
							buttonIcon="search"
							(buttonClick)="goToQueue()"
						></app-empty-state>

						<div
							class="complaints-grid"
							*ngIf="!isLoading && activeComplaints.length > 0"
						>
							<mat-card
								*ngFor="let complaint of activeComplaints"
								class="complaint-card"
								[class.overdue]="complaint.is_overdue"
								(click)="viewComplaint(complaint)"
							>
								<div class="card-header">
									<div class="badges">
										<app-status-badge
											[status]="complaint.status"
										></app-status-badge>
										<app-priority-badge
											[priority]="complaint.priority"
										></app-priority-badge>
									</div>
									<app-sla-indicator
										[slaDeadline]="complaint.sla_deadline"
										[isOverdue]="complaint.is_overdue"
									></app-sla-indicator>
								</div>

								<h3 class="card-title">{{ complaint.title }}</h3>

								<div class="card-meta">
									<span
										><mat-icon>category</mat-icon>
										{{ complaint.category | categoryLabel }}</span
									>
									<span
										><mat-icon>person</mat-icon> {{ complaint.user_name }}</span
									>
								</div>

								<div class="card-actions">
									<button
										mat-stroked-button
										color="primary"
										(click)="
											updateStatus(complaint, 'resolved');
											$event.stopPropagation()
										"
									>
										<mat-icon>check</mat-icon>
										Mark Resolved
									</button>
								</div>
							</mat-card>
						</div>
					</div>
				</mat-tab>

				<mat-tab>
					<ng-template mat-tab-label>
						<mat-icon>check_circle</mat-icon>
						Resolved
						<span class="tab-count" *ngIf="resolvedComplaints.length > 0">
							{{ resolvedComplaints.length }}
						</span>
					</ng-template>

					<div class="tab-content">
						<app-loading-spinner
							*ngIf="isLoadingResolved"
						></app-loading-spinner>

						<app-empty-state
							*ngIf="!isLoadingResolved && resolvedComplaints.length === 0"
							icon="history"
							title="No resolved complaints"
							message="Complaints you resolve will appear here"
						></app-empty-state>

						<div
							class="complaints-grid"
							*ngIf="!isLoadingResolved && resolvedComplaints.length > 0"
						>
							<mat-card
								*ngFor="let complaint of resolvedComplaints"
								class="complaint-card resolved"
								(click)="viewComplaint(complaint)"
							>
								<div class="card-header">
									<app-status-badge
										[status]="complaint.status"
									></app-status-badge>
									<span class="resolved-date">{{
										complaint.resolved_at | date : "shortDate"
									}}</span>
								</div>

								<h3 class="card-title">{{ complaint.title }}</h3>

								<div class="card-meta">
									<span
										><mat-icon>category</mat-icon>
										{{ complaint.category | categoryLabel }}</span
									>
									<span
										><mat-icon>person</mat-icon> {{ complaint.user_name }}</span
									>
								</div>

								<div class="feedback-info" *ngIf="complaint.feedback_rating">
									<app-star-rating
										[rating]="complaint.feedback_rating"
										[readonly]="true"
										size="small"
									></app-star-rating>
								</div>
							</mat-card>
						</div>
					</div>
				</mat-tab>
			</mat-tab-group>
		</div>
	`,
	styles: [
		`
			.page-header {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 24px;
				flex-wrap: wrap;
				gap: 16px;
			}

			.page-header h1 {
				margin: 0 0 4px;
			}

			.subtitle {
				margin: 0;
				color: var(--text-secondary);
			}

			.availability-toggle {
				display: flex;
				align-items: center;
				gap: 12px;
				padding: 12px 16px;
				background: var(--bg-card);
				border-radius: 8px;
				box-shadow: var(--shadow-sm);
			}

			.stats-row {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
				gap: 16px;
				margin-bottom: 24px;
			}

			.stat-card {
				display: flex;
				align-items: center;
				gap: 16px;
				padding: 20px;
			}

			.stat-icon {
				width: 48px;
				height: 48px;
				border-radius: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.stat-icon mat-icon {
				color: white;
			}

			.stat-icon.in-progress {
				background: linear-gradient(135deg, #2196f3, #1976d2);
			}

			.stat-icon.overdue {
				background: linear-gradient(135deg, #f44336, #d32f2f);
			}

			.stat-icon.resolved {
				background: linear-gradient(135deg, #4caf50, #388e3c);
			}

			.stat-content {
				display: flex;
				flex-direction: column;
			}

			.stat-value {
				font-size: 1.5rem;
				font-weight: 600;
			}

			.stat-label {
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			.tab-count {
				margin-left: 8px;
				padding: 2px 8px;
				border-radius: 12px;
				background-color: var(--primary-color);
				color: white;
				font-size: 0.75rem;
			}

			.tab-content {
				padding: 24px 0;
			}

			.complaints-grid {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
				gap: 16px;
			}

			.complaint-card {
				cursor: pointer;
				transition: all 0.2s ease;
				padding: 20px;
			}

			.complaint-card:hover {
				box-shadow: var(--shadow-md);
				transform: translateY(-2px);
			}

			.complaint-card.overdue {
				border-left: 4px solid #f44336;
			}

			.complaint-card.resolved {
				opacity: 0.9;
			}

			.card-header {
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
			}

			.resolved-date {
				font-size: 0.75rem;
				color: var(--text-secondary);
			}

			.card-title {
				margin: 0 0 12px;
				font-size: 1rem;
				font-weight: 500;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				overflow: hidden;
			}

			.card-meta {
				display: flex;
				flex-direction: column;
				gap: 4px;
				font-size: 0.875rem;
				color: var(--text-secondary);
				margin-bottom: 16px;
			}

			.card-meta span {
				display: flex;
				align-items: center;
				gap: 4px;
			}

			.card-meta mat-icon {
				font-size: 16px;
				width: 16px;
				height: 16px;
			}

			.card-actions {
				display: flex;
				justify-content: flex-end;
			}

			.feedback-info {
				display: flex;
				justify-content: flex-end;
			}

			@media (max-width: 600px) {
				.complaints-grid {
					grid-template-columns: 1fr;
				}
			}
		`,
	],
})
export class AssignedComplaintsComponent implements OnInit {
	activeComplaints: Complaint[] = [];
	resolvedComplaints: Complaint[] = [];
	isLoading = true;
	isLoadingResolved = false;
	selectedTab = 0;
	isAvailable = true;

	inProgressCount = 0;
	overdueCount = 0;
	resolvedTodayCount = 0;

	constructor(
		private router: Router,
		private dialog: MatDialog,
		private complaintService: ComplaintService,
		private authService: AuthService,
		private userService: UserService,
		private snackbar: SnackbarService
	) {}

	ngOnInit(): void {
		this.loadActiveComplaints();
		this.loadStaffStatus();
	}

	private loadStaffStatus(): void {
		const user = this.authService.currentUser;
		if (user) {
			this.isAvailable =
				user.availability_status === AvailabilityStatus.AVAILABLE;
		}
	}

	loadActiveComplaints(): void {
		this.isLoading = true;
		const staffId = this.authService.currentUser?.id;
		if (!staffId) return;

		this.complaintService
			.getComplaints({
				assigned_to: staffId,
				status: `${ComplaintStatus.OPEN},${ComplaintStatus.ASSIGNED},${ComplaintStatus.IN_PROGRESS}`,
			})
			.subscribe({
				next: (response) => {
					this.activeComplaints = response.data || [];
					this.inProgressCount = this.activeComplaints.filter(
						(c) => c.status === ComplaintStatus.IN_PROGRESS
					).length;
					this.overdueCount = this.activeComplaints.filter(
						(c) => c.is_overdue
					).length;
					this.isLoading = false;
				},
				error: () => {
					this.isLoading = false;
				},
			});

		// Load resolved today count
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		this.complaintService
			.getComplaints({
				assigned_to: staffId,
				status: ComplaintStatus.RESOLVED,
				resolved_after: today.toISOString(),
			})
			.subscribe({
				next: (response) => {
					this.resolvedTodayCount = response.pagination?.total || 0;
				},
			});
	}

	loadResolvedComplaints(): void {
		if (this.resolvedComplaints.length > 0) return;

		this.isLoadingResolved = true;
		const staffId = this.authService.currentUser?.id;
		if (!staffId) return;

		this.complaintService
			.getComplaints({
				assigned_to: staffId,
				status: ComplaintStatus.RESOLVED,
				limit: 50,
			})
			.subscribe({
				next: (response) => {
					this.resolvedComplaints = response.data || [];
					this.isLoadingResolved = false;
				},
				error: () => {
					this.isLoadingResolved = false;
				},
			});
	}

	onTabChange(): void {
		if (this.selectedTab === 1) {
			this.loadResolvedComplaints();
		}
	}

	toggleAvailability(available: boolean): void {
		const status = available
			? AvailabilityStatus.AVAILABLE
			: AvailabilityStatus.BUSY;
		this.userService.updateAvailability(status).subscribe({
			next: (user) => {
				this.authService.updateCurrentUser(user);
				this.isAvailable = available;
				this.snackbar.success(
					available
						? "You are now available for assignments"
						: "You are now unavailable"
				);
			},
		});
	}

	updateStatus(complaint: Complaint, status: string): void {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			data: {
				title: 'Mark as Resolved',
				message: `Are you sure you want to mark "${complaint.title}" as resolved? The user will be notified.`,
				confirmText: 'Mark Resolved',
				cancelText: 'Cancel',
				confirmColor: 'primary'
			}
		});

		dialogRef.afterClosed().subscribe(confirmed => {
			if (confirmed) {
				this.complaintService
					.updateComplaint(complaint.id, { status: status as ComplaintStatus })
					.subscribe({
						next: () => {
							this.activeComplaints = this.activeComplaints.filter(
								(c) => c.id !== complaint.id
							);
							this.snackbar.success("Complaint marked as resolved!");
							this.resolvedTodayCount++;
							this.resolvedComplaints = [];
						},
						error: (err) => {
							const errorMsg = err.error?.error || "Failed to update complaint status";
							this.snackbar.error(errorMsg);
						}
					});
			}
		});
	}

	viewComplaint(complaint: Complaint): void {
		this.router.navigate(["/complaints", complaint.id]);
	}

	goToQueue(): void {
		this.router.navigate(["/staff/queue"]);
	}
}
