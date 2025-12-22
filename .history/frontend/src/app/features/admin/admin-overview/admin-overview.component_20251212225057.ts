import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AnalyticsService } from "@core/services/analytics.service";
import { ComplaintService } from "@core/services/complaint.service";
import { Analytics, Complaint, ComplaintStatus } from "@core/models";

@Component({
	selector: "app-admin-overview",
	template: `
		<div class="page-container">
			<div class="page-header fade-in">
				<div class="header-left">
					<h1>Admin Dashboard</h1>
					<p class="subtitle">System overview and key metrics</p>
				</div>
				<div class="header-actions">
					<button mat-stroked-button routerLink="/admin/analytics">
						<mat-icon>analytics</mat-icon>
						Full Analytics
					</button>
				</div>
			</div>

			<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

			<ng-container *ngIf="!isLoading && analytics">
				<!-- Key Metrics -->
				<div class="metrics-grid fade-in">
					<mat-card class="metric-card">
						<div class="metric-icon total">
							<mat-icon>folder</mat-icon>
						</div>
						<div class="metric-content">
						<span class="metric-value">{{ analytics.overview.total_complaints }}</span>
							<span class="metric-label">Total Complaints</span>
						</div>
					</mat-card>

					<mat-card class="metric-card">
						<div class="metric-icon pending">
							<mat-icon>pending</mat-icon>
						</div>
						<div class="metric-content">
							<span class="metric-value">{{
							analytics.overview.pending_complaints || 0
							}}</span>
							<span class="metric-label">Pending</span>
						</div>
					</mat-card>

					<mat-card class="metric-card">
						<div class="metric-icon in-progress">
							<mat-icon>hourglass_empty</mat-icon>
						</div>
						<div class="metric-content">
							<span class="metric-value">{{
							analytics.by_status.find(s => s.status === 'in_progress')?.count || 0
							}}</span>
							<span class="metric-label">In Progress</span>
						</div>
					</mat-card>

					<mat-card class="metric-card clickable" (click)="viewOverdue()">
						<div class="metric-icon overdue">
							<mat-icon>warning</mat-icon>
						</div>
						<div class="metric-content">
						<span class="metric-value">{{ analytics.overview.overdue_complaints }}</span>
							<span class="metric-label">Overdue</span>
						</div>
						<mat-icon class="arrow-icon">chevron_right</mat-icon>
					</mat-card>

					<mat-card class="metric-card">
						<div class="metric-icon resolved">
							<mat-icon>check_circle</mat-icon>
						</div>
						<div class="metric-content">
							<span class="metric-value">{{
							analytics.overview.resolved_complaints || 0
							}}</span>
							<span class="metric-label">Resolved</span>
						</div>
					</mat-card>

					<mat-card class="metric-card">
						<div class="metric-icon avg-time">
							<mat-icon>timer</mat-icon>
						</div>
						<div class="metric-content">
							<span class="metric-value">{{
							formatDuration(analytics.overview.average_resolution_hours)
							}}</span>
							<span class="metric-label">Avg. Resolution</span>
						</div>
					</mat-card>
				</div>

				<!-- Charts Row -->
				<div class="charts-row fade-in">
					<!-- Status Distribution -->
					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>Status Distribution</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<div class="status-chart">
								<div
									class="status-bar"
									*ngFor="let status of statusData"
									[style.width.%]="
										(status.count / analytics.total_complaints) * 100
									"
									[class]="'status-' + status.key"
									[matTooltip]="status.label + ': ' + status.count"
								></div>
							</div>
							<div class="chart-legend">
								<div class="legend-item" *ngFor="let status of statusData">
									<span
										class="legend-dot"
										[class]="'status-' + status.key"
									></span>
									<span class="legend-label">{{ status.label }}</span>
									<span class="legend-value">{{ status.count }}</span>
								</div>
							</div>
						</mat-card-content>
					</mat-card>

					<!-- Category Distribution -->
					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>By Category</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<div class="category-list">
								<div class="category-item" *ngFor="let cat of categoryData">
									<div class="category-info">
										<span class="category-name">{{ cat.label }}</span>
										<span class="category-count">{{ cat.count }}</span>
									</div>
									<mat-progress-bar
										mode="determinate"
										[value]="(cat.count / maxCategoryCount) * 100"
									></mat-progress-bar>
								</div>
							</div>
						</mat-card-content>
					</mat-card>
				</div>

				<!-- Staff Performance -->
				<mat-card class="staff-card fade-in">
					<mat-card-header>
						<mat-card-title>Staff Performance</mat-card-title>
						<button mat-button routerLink="/admin/staff">View All</button>
					</mat-card-header>
					<mat-card-content>
						<div class="table-container">
							<table
								mat-table
								[dataSource]="analytics.staff_performance"
								class="staff-table"
							>
								<ng-container matColumnDef="name">
									<th mat-header-cell *matHeaderCellDef>Staff Name</th>
									<td mat-cell *matCellDef="let staff">{{ staff.name }}</td>
								</ng-container>

								<ng-container matColumnDef="resolved">
									<th mat-header-cell *matHeaderCellDef>Resolved</th>
									<td mat-cell *matCellDef="let staff">
										{{ staff.resolved_count }}
									</td>
								</ng-container>

								<ng-container matColumnDef="avgTime">
									<th mat-header-cell *matHeaderCellDef>Avg. Time</th>
									<td mat-cell *matCellDef="let staff">
										{{ formatDuration(staff.avg_resolution_time) }}
									</td>
								</ng-container>

								<ng-container matColumnDef="rating">
									<th mat-header-cell *matHeaderCellDef>Rating</th>
									<td mat-cell *matCellDef="let staff">
										<div class="rating-cell">
											<app-star-rating
												[rating]="staff.avg_rating"
												[readonly]="true"
												size="small"
											></app-star-rating>
											<span>{{ staff.avg_rating | number : "1.1-1" }}</span>
										</div>
									</td>
								</ng-container>

								<ng-container matColumnDef="load">
									<th mat-header-cell *matHeaderCellDef>Current Load</th>
									<td mat-cell *matCellDef="let staff">
										<span
											class="load-badge"
											[class.high]="staff.current_load > 10"
											[class.medium]="
												staff.current_load > 5 && staff.current_load <= 10
											"
										>
											{{ staff.current_load }}
										</span>
									</td>
								</ng-container>

								<tr mat-header-row *matHeaderRowDef="staffColumns"></tr>
								<tr mat-row *matRowDef="let row; columns: staffColumns"></tr>
							</table>
						</div>
					</mat-card-content>
				</mat-card>

				<!-- Recent Overdue -->
				<mat-card
					class="overdue-card fade-in"
					*ngIf="overdueComplaints.length > 0"
				>
					<mat-card-header>
						<mat-card-title class="overdue-title">
							<mat-icon color="warn">warning</mat-icon>
							Overdue Complaints Requiring Attention
						</mat-card-title>
					</mat-card-header>
					<mat-card-content>
						<div class="overdue-list">
							<div
								class="overdue-item"
								*ngFor="let complaint of overdueComplaints.slice(0, 5)"
								(click)="viewComplaint(complaint)"
							>
								<div class="overdue-info">
									<h4>{{ complaint.title }}</h4>
									<div class="overdue-meta">
										<app-priority-badge
											[priority]="complaint.priority"
										></app-priority-badge>
										<span>{{ complaint.category | categoryLabel }}</span>
										<span>•</span>
										<span>{{ complaint.user_name }}</span>
									</div>
								</div>
								<div class="overdue-sla">
									<app-sla-indicator
										[slaDeadline]="complaint.sla_deadline"
										[isOverdue]="true"
									></app-sla-indicator>
								</div>
							</div>
						</div>
					</mat-card-content>
				</mat-card>
			</ng-container>
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

			.metrics-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
				gap: 16px;
				margin-bottom: 24px;
			}

			.metric-card {
				display: flex;
				align-items: center;
				gap: 16px;
				padding: 20px;
				position: relative;
			}

			.metric-card.clickable {
				cursor: pointer;
				transition: all 0.2s ease;
			}

			.metric-card.clickable:hover {
				box-shadow: var(--shadow-md);
				transform: translateY(-2px);
			}

			.metric-icon {
				width: 48px;
				height: 48px;
				border-radius: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.metric-icon mat-icon {
				color: white;
			}

			.metric-icon.total {
				background: linear-gradient(135deg, #3f51b5, #303f9f);
			}

			.metric-icon.pending {
				background: linear-gradient(135deg, #9e9e9e, #757575);
			}

			.metric-icon.in-progress {
				background: linear-gradient(135deg, #2196f3, #1976d2);
			}

			.metric-icon.overdue {
				background: linear-gradient(135deg, #f44336, #d32f2f);
			}

			.metric-icon.resolved {
				background: linear-gradient(135deg, #4caf50, #388e3c);
			}

			.metric-icon.avg-time {
				background: linear-gradient(135deg, #ff9800, #f57c00);
			}

			.metric-content {
				display: flex;
				flex-direction: column;
			}

			.metric-value {
				font-size: 1.5rem;
				font-weight: 600;
			}

			.metric-label {
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			.arrow-icon {
				position: absolute;
				right: 12px;
				color: var(--text-secondary);
			}

			.charts-row {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
				gap: 24px;
				margin-bottom: 24px;
			}

			.chart-card mat-card-content {
				padding: 16px;
			}

			.status-chart {
				display: flex;
				height: 24px;
				border-radius: 12px;
				overflow: hidden;
				margin-bottom: 16px;
			}

			.status-bar {
				min-width: 4px;
				transition: width 0.3s ease;
			}

			.status-bar.status-pending {
				background-color: #9e9e9e;
			}

			.status-bar.status-in_progress {
				background-color: #2196f3;
			}

			.status-bar.status-resolved {
				background-color: #4caf50;
			}

			.status-bar.status-rejected {
				background-color: #f44336;
			}

			.status-bar.status-escalated {
				background-color: #ff9800;
			}

			.status-bar.status-closed {
				background-color: #3f51b5;
			}

			.chart-legend {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
				gap: 8px;
			}

			.legend-item {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.legend-dot {
				width: 12px;
				height: 12px;
				border-radius: 50%;
			}

			.legend-dot.status-pending {
				background-color: #9e9e9e;
			}

			.legend-dot.status-in_progress {
				background-color: #2196f3;
			}

			.legend-dot.status-resolved {
				background-color: #4caf50;
			}

			.legend-dot.status-rejected {
				background-color: #f44336;
			}

			.legend-dot.status-escalated {
				background-color: #ff9800;
			}

			.legend-dot.status-closed {
				background-color: #3f51b5;
			}

			.legend-label {
				flex: 1;
				font-size: 0.875rem;
			}

			.legend-value {
				font-weight: 500;
			}

			.category-list {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.category-item {
				display: flex;
				flex-direction: column;
				gap: 8px;
			}

			.category-info {
				display: flex;
				justify-content: space-between;
			}

			.category-name {
				font-size: 0.875rem;
			}

			.category-count {
				font-weight: 500;
			}

			.staff-card mat-card-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			.table-container {
				overflow-x: auto;
			}

			.staff-table {
				width: 100%;
			}

			.rating-cell {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.load-badge {
				padding: 4px 8px;
				border-radius: 4px;
				font-size: 0.875rem;
				font-weight: 500;
				background-color: rgba(76, 175, 80, 0.15);
				color: #4caf50;
			}

			.load-badge.medium {
				background-color: rgba(255, 152, 0, 0.15);
				color: #ff9800;
			}

			.load-badge.high {
				background-color: rgba(244, 67, 54, 0.15);
				color: #f44336;
			}

			.overdue-card {
				margin-bottom: 24px;
				border-left: 4px solid #f44336;
			}

			.overdue-title {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.overdue-list {
				display: flex;
				flex-direction: column;
				gap: 12px;
			}

			.overdue-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 16px;
				background-color: rgba(244, 67, 54, 0.05);
				border-radius: 8px;
				cursor: pointer;
				transition: all 0.2s ease;
			}

			.overdue-item:hover {
				background-color: rgba(244, 67, 54, 0.1);
			}

			.overdue-info h4 {
				margin: 0 0 8px;
			}

			.overdue-meta {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			@media (max-width: 768px) {
				.charts-row {
					grid-template-columns: 1fr;
				}

				.overdue-item {
					flex-direction: column;
					align-items: flex-start;
					gap: 12px;
				}
			}
		`,
	],
})
export class AdminOverviewComponent implements OnInit {
	analytics: Analytics | null = null;
	overdueComplaints: Complaint[] = [];
	isLoading = true;

	staffColumns = ["name", "resolved", "avgTime", "rating", "load"];

	statusData: { key: string; label: string; count: number }[] = [];
	categoryData: { key: string; label: string; count: number }[] = [];
	maxCategoryCount = 1;

	private categoryLabels: Record<string, string> = {
		service_delay: "Service Delay",
		staff_behavior: "Staff Behavior",
		technical_issue: "Technical Issue",
		billing: "Billing",
		facility: "Facility",
		other: "Other",
	};

	private statusLabels: Record<string, string> = {
		pending: "Pending",
		in_progress: "In Progress",
		resolved: "Resolved",
		rejected: "Rejected",
		escalated: "Escalated",
		closed: "Closed",
	};

	constructor(
		private router: Router,
		private analyticsService: AnalyticsService,
		private complaintService: ComplaintService
	) {}

	ngOnInit(): void {
		this.loadAnalytics();
		this.loadOverdueComplaints();
	}

	private loadAnalytics(): void {
		this.analyticsService.getAnalytics().subscribe({
			next: (data) => {
				this.analytics = data;
				this.processStatusData(data);
				this.processCategoryData(data);
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	private processStatusData(data: Analytics): void {
		this.statusData = Object.entries(data.status_breakdown).map(
			([key, count]) => ({
				key,
				label: this.statusLabels[key] || key,
				count: count as number,
			})
		);
	}

	private processCategoryData(data: Analytics): void {
		this.categoryData = Object.entries(data.category_breakdown).map(
			([key, count]) => ({
				key,
				label: this.categoryLabels[key] || key,
				count: count as number,
			})
		);
		this.maxCategoryCount = Math.max(
			...this.categoryData.map((c) => c.count),
			1
		);
	}

	private loadOverdueComplaints(): void {
		this.complaintService
			.getComplaints({ is_overdue: true, limit: 5 })
			.subscribe({
				next: (response) => {
					this.overdueComplaints = response.complaints;
				},
			});
	}

	formatDuration(hours: number): string {
		if (!hours) return "N/A";

		if (hours < 1) {
			return `${Math.round(hours * 60)}m`;
		} else if (hours < 24) {
			return `${Math.round(hours)}h`;
		} else {
			const days = Math.floor(hours / 24);
			return `${days}d`;
		}
	}

	viewOverdue(): void {
		this.router.navigate(["/complaints"], {
			queryParams: { is_overdue: true },
		});
	}

	viewComplaint(complaint: Complaint): void {
		this.router.navigate(["/complaints", complaint.id]);
	}
}
