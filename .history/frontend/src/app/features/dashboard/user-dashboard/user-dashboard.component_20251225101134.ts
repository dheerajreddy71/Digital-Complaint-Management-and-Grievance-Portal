import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ComplaintService } from "@core/services/complaint.service";
import { AuthService } from "@core/services/auth.service";
import { Complaint, ComplaintStatus } from "@core/models";

@Component({
	selector: "app-user-dashboard",
	template: `
		<div class="dashboard fade-in">
			<div class="page-header">
				<div>
					<h1>Welcome, {{ userName }}!</h1>
					<p class="subtitle">Manage your complaints and track their status</p>
				</div>
				<button mat-flat-button color="primary" routerLink="/complaints/new">
					<mat-icon>add</mat-icon>
					New Complaint
				</button>
			</div>

			<!-- Stats Cards -->
			<div class="stats-grid">
				<mat-card class="stat-card">
					<mat-card-content>
						<div class="stat-icon pending">
							<mat-icon>pending</mat-icon>
						</div>
						<div class="stat-info">
							<span class="stat-value">{{ stats.pending }}</span>
							<span class="stat-label">Pending</span>
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
							<span class="stat-value">{{ stats.resolved }}</span>
							<span class="stat-label">Resolved</span>
						</div>
					</mat-card-content>
				</mat-card>

				<mat-card class="stat-card">
					<mat-card-content>
						<div class="stat-icon total">
							<mat-icon>assignment</mat-icon>
						</div>
						<div class="stat-info">
							<span class="stat-value">{{ stats.total }}</span>
							<span class="stat-label">Total</span>
						</div>
					</mat-card-content>
				</mat-card>
			</div>

			<!-- Recent Complaints -->
			<mat-card class="recent-complaints">
				<mat-card-header>
					<mat-card-title>Recent Complaints</mat-card-title>
					<a mat-button color="primary" routerLink="/complaints">View All</a>
				</mat-card-header>
				<mat-card-content>
					<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

					<app-empty-state
						*ngIf="!isLoading && complaints.length === 0"
						icon="report_problem"
						title="No complaints yet"
						message="You haven't submitted any complaints. Click the button above to create your first complaint."
					></app-empty-state>

					<div
						class="complaints-list"
						*ngIf="!isLoading && complaints.length > 0"
					>
						<div
							*ngFor="let complaint of complaints"
							class="complaint-item"
							[routerLink]="['/complaints', complaint.id]"
						>
							<div class="complaint-main">
								<h4>{{ complaint.title }}</h4>
								<p class="complaint-desc">
									{{ complaint.description | truncate : 100 }}
								</p>
								<div class="complaint-meta">
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
							<div class="complaint-status">
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

			.stat-icon.pending {
				background: linear-gradient(135deg, #ff9800, #f57c00);
			}

			.stat-icon.in-progress {
				background: linear-gradient(135deg, #9c27b0, #7b1fa2);
			}

			.stat-icon.resolved {
				background: linear-gradient(135deg, #4caf50, #388e3c);
			}

			.stat-icon.total {
				background: linear-gradient(135deg, #3f51b5, #303f9f);
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

			.recent-complaints mat-card-header {
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

			.complaint-main h4 {
				margin: 0 0 4px;
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

			.complaint-status {
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

				.page-header button {
					width: 100%;
				}

				.complaint-item {
					flex-direction: column;
					gap: 12px;
				}

				.complaint-status {
					flex-direction: row;
					margin-left: 0;
					align-items: center;
				}
			}
		`,
	],
})
export class UserDashboardComponent implements OnInit {
	userName = "";
	isLoading = true;
	complaints: Complaint[] = [];
	stats = {
		pending: 0,
		inProgress: 0,
		resolved: 0,
		total: 0,
	};

	constructor(
		private complaintService: ComplaintService,
		private authService: AuthService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.userName = this.authService.currentUser?.name || "User";
		console.log("UserDashboard - Initializing for user:", this.userName);
		this.loadComplaints();
	}

	private loadComplaints(): void {
		console.log("UserDashboard - Loading complaints...");
		// Load all complaints for stats, but show only recent 5
		this.complaintService.getMyComplaints({}).subscribe({
			next: (response) => {
				console.log("UserDashboard - Complaints loaded:", response);
				const allComplaints = response.data;
				this.calculateStats(allComplaints);
				// Show only 5 most recent
				this.complaints = allComplaints.slice(0, 5);
				this.isLoading = false;
			},
			error: (error) => {
				console.error("UserDashboard - Error loading complaints:", error);
				this.isLoading = false;
			},
		});
	}

	private calculateStats(complaints: Complaint[]): void {
		this.stats = {
			pending: complaints.filter(
				(c) =>
					c.status === ComplaintStatus.OPEN ||
					c.status === ComplaintStatus.ASSIGNED
			).length,
			inProgress: complaints.filter(
				(c) => c.status === ComplaintStatus.IN_PROGRESS
			).length,
			resolved: complaints.filter((c) => c.status === ComplaintStatus.RESOLVED)
				.length,
			total: complaints.length,
		};
	}
}
