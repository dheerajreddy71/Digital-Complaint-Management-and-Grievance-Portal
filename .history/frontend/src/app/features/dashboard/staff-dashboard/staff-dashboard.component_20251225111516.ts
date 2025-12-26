import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ComplaintService } from "@core/services/complaint.service";
import { AuthService } from "@core/services/auth.service";
import { UserService } from "@core/services/user.service";
import { Complaint, ComplaintStatus, AvailabilityStatus } from "@core/models";

@Component({
	selector: "app-staff-dashboard",
	template: `
		<div class="dashboard fade-in">
			<div class="page-header">
				<div>
					<h1>Staff Dashboard</h1>
					<p class="subtitle">
						Manage assigned complaints and track your workload
					</p>
				</div>
				<div class="availability-toggle">
					<span>Availability:</span>
					<mat-slide-toggle
						[checked]="isAvailable"
						(change)="toggleAvailability($event.checked)"
						color="primary"
					>
						{{ isAvailable ? "Available" : "Busy" }}
					</mat-slide-toggle>
				</div>
			</div>

			<!-- Stats Cards -->
			<div class="stats-grid">
				<mat-card class="stat-card" (click)="navigateToQueue()">
					<mat-card-content>
						<div class="stat-icon assigned">
							<mat-icon>assignment_ind</mat-icon>
						</div>
						<div class="stat-info">
							<span class="stat-value">{{ stats.assigned }}</span>
							<span class="stat-label">Assigned to Me</span>
						</div>
					</mat-card-content>
				</mat-card>

				<mat-card class="stat-card warning">
					<mat-card-content>
						<div class="stat-icon overdue">
							<mat-icon>warning</mat-icon>
						</div>
						<div class="stat-info">
							<span class="stat-value">{{ stats.overdue }}</span>
							<span class="stat-label">Overdue</span>
						</div>
					</mat-card-content>
				</mat-card>

				<mat-card class="stat-card">
					<mat-card-content>
						<div class="stat-icon in-progress">
							<mat-icon>autorenew</mat-icon>
						</div>
						<div class="stat-info">
							<span class="stat-value">{{ stats.inProgress }}</span>
							<span class="stat-label">In Progress</span>
						</div>
					</mat-card-content>
				</mat-card>

				<mat-card class="stat-card">
					<mat-card-content>
						<div class="stat-icon resolved">
							<mat-icon>check_circle</mat-icon>
						</div>
						<div class="stat-info">
							<span class="stat-value">{{ stats.resolvedToday }}</span>
							<span class="stat-label">Resolved Today</span>
						</div>
					</mat-card-content>
				</mat-card>
			</div>

			<!-- Assigned Complaints -->
			<mat-card class="complaints-card">
				<mat-card-header>
					<mat-card-title>My Assigned Complaints</mat-card-title>
					<a mat-button color="primary" routerLink="/staff/assigned"
						>View All</a
					>
				</mat-card-header>
				<mat-card-content>
					<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

					<app-empty-state
						*ngIf="!isLoading && complaints.length === 0"
						icon="inbox"
						title="No assigned complaints"
						message="You don't have any complaints assigned to you at the moment."
					></app-empty-state>

					<div
						class="complaints-list"
						*ngIf="!isLoading && complaints.length > 0"
					>
						<div
							*ngFor="let complaint of complaints"
							class="complaint-item"
							[class.overdue]="complaint.is_overdue"
							[routerLink]="['/complaints', complaint.id]"
						>
							<div class="complaint-main">
								<div class="complaint-header">
									<h4>{{ complaint.title }}</h4>
									<app-sla-indicator
										[slaDeadline]="complaint.sla_deadline"
										[isOverdue]="complaint.is_overdue"
									></app-sla-indicator>
								</div>
								<p class="complaint-desc">
									{{ complaint.description | truncate : 80 }}
								</p>
								<div class="complaint-meta">
									<span class="meta-item">
										<mat-icon>person</mat-icon>
										{{ complaint.user_name }}
									</span>
									<span class="meta-item">
										<mat-icon>category</mat-icon>
										{{ complaint.category | categoryLabel }}
									</span>
									<span class="meta-item">
										<mat-icon>schedule</mat-icon>
										{{ complaint.created_at | timeAgo }}
									</span>
								</div>
							</div>
							<div class="complaint-actions">
								<app-status-badge
									[status]="complaint.status"
								></app-status-badge>
								<app-priority-badge
									[priority]="complaint.priority"
								></app-priority-badge>
							</div>
						</div>
					</div>
				</mat-card-content>
			</mat-card>
		</div>
	`,
	styles: [
		`
			.dashboard {
				max-width: 1200px;
				margin: 0 auto;
			}

			.page-header {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 24px;
				flex-wrap: wrap;
				gap: 16px;
			}

			.page-header h1 {
				margin: 0;
				font-size: 1.75rem;
			}

			.subtitle {
				margin: 4px 0 0;
				color: var(--text-secondary);
			}

			.availability-toggle {
				display: flex;
				align-items: center;
				gap: 12px;
				background: var(--bg-card);
				padding: 12px 16px;
				border-radius: 8px;
				box-shadow: var(--shadow-sm);
			}

			.stats-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
				gap: 16px;
				margin-bottom: 24px;
			}

			.stat-card {
				cursor: pointer;
				transition: transform 0.2s, box-shadow 0.2s;
			}

			.stat-card:hover {
				transform: translateY(-2px);
				box-shadow: var(--shadow-md);
			}

			.stat-card.warning {
				border-left: 4px solid #f44336;
			}

			.stat-card mat-card-content {
				display: flex;
				align-items: center;
				gap: 16px;
				padding: 16px !important;
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
				font-size: 24px;
				width: 24px;
				height: 24px;
				color: white;
			}

			.stat-icon.assigned {
				background: linear-gradient(135deg, #2196f3, #1976d2);
			}

			.stat-icon.overdue {
				background: linear-gradient(135deg, #f44336, #d32f2f);
			}

			.stat-icon.in-progress {
				background: linear-gradient(135deg, #9c27b0, #7b1fa2);
			}

			.stat-icon.resolved {
				background: linear-gradient(135deg, #4caf50, #388e3c);
			}

			.stat-info {
				display: flex;
				flex-direction: column;
			}

			.stat-value {
				font-size: 1.75rem;
				font-weight: 600;
				line-height: 1;
			}

			.stat-label {
				color: var(--text-secondary);
				font-size: 0.875rem;
				margin-top: 4px;
			}

			.complaints-card mat-card-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 16px 16px 0;
			}

			.complaints-list {
				display: flex;
				flex-direction: column;
			}

			.complaint-item {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				padding: 16px;
				border-bottom: 1px solid var(--border-color);
				cursor: pointer;
				transition: background-color 0.2s;
			}

			.complaint-item.overdue {
				background-color: rgba(244, 67, 54, 0.05);
				border-left: 3px solid #f44336;
			}

			.complaint-item:last-child {
				border-bottom: none;
			}

			.complaint-item:hover {
				background-color: rgba(0, 0, 0, 0.02);
			}

			.complaint-main {
				flex: 1;
				min-width: 0;
			}

			.complaint-header {
				display: flex;
				align-items: center;
				gap: 12px;
				margin-bottom: 4px;
			}

			.complaint-header h4 {
				margin: 0;
				font-weight: 500;
			}

			.complaint-desc {
				margin: 0 0 8px;
				color: var(--text-secondary);
				font-size: 0.875rem;
			}

			.complaint-meta {
				display: flex;
				gap: 16px;
				flex-wrap: wrap;
			}

			.meta-item {
				display: flex;
				align-items: center;
				gap: 4px;
				color: var(--text-secondary);
				font-size: 0.75rem;
			}

			.meta-item mat-icon {
				font-size: 14px;
				width: 14px;
				height: 14px;
			}

			.complaint-actions {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				gap: 8px;
				margin-left: 16px;
			}

			@media (max-width: 600px) {
				.page-header {
					flex-direction: column;
					align-items: stretch;
				}

				.availability-toggle {
					justify-content: center;
				}

				.complaint-item {
					flex-direction: column;
					gap: 12px;
				}

				.complaint-actions {
					flex-direction: row;
					margin-left: 0;
					align-items: center;
				}
			}
		`,
	],
})
export class StaffDashboardComponent implements OnInit {
	isLoading = true;
	isAvailable = true;
	complaints: Complaint[] = [];
	stats = {
		assigned: 0,
		overdue: 0,
		inProgress: 0,
		resolvedToday: 0,
	};

	constructor(
		private complaintService: ComplaintService,
		private userService: UserService,
		private authService: AuthService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.isAvailable =
			this.authService.currentUser?.availability_status ===
			AvailabilityStatus.AVAILABLE;
		this.loadComplaints();
	}

	private loadComplaints(): void {
		this.complaintService.getAssignedComplaints({ limit: 10 }).subscribe({
			next: (response) => {
				this.complaints = response.data;
				this.calculateStats(response.data);
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	private calculateStats(complaints: Complaint[]): void {
		const today = new Date().toDateString();
		const activeComplaints = complaints.filter(
			(c) =>
				c.status === ComplaintStatus.ASSIGNED ||
				c.status === ComplaintStatus.IN_PROGRESS
		);
		this.stats = {
			assigned: activeComplaints.length,
			overdue: activeComplaints.filter((c) => c.is_overdue).length,
			inProgress: complaints.filter(
				(c) => c.status === ComplaintStatus.IN_PROGRESS
			).length,
			resolvedToday: complaints.filter(
				(c) =>
					c.status === ComplaintStatus.RESOLVED &&
					c.resolved_at &&
					new Date(c.resolved_at).toDateString() === today
			).length,
		};
	}

	toggleAvailability(isAvailable: boolean): void {
		const status = isAvailable
			? AvailabilityStatus.AVAILABLE
			: AvailabilityStatus.BUSY;
		this.userService.updateAvailability(status).subscribe({
			next: (user) => {
				this.authService.updateCurrentUser(user);
				this.isAvailable = isAvailable;
			},
		});
	}

	navigateToQueue(): void {
		this.router.navigate(["/staff/assigned"]);
	}
}
