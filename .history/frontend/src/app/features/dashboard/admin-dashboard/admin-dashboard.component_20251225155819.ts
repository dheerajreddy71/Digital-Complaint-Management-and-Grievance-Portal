import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AnalyticsService } from "@core/services/analytics.service";
import { ComplaintService } from "@core/services/complaint.service";
import {
	AnalyticsData,
	Complaint,
	ComplaintStatus,
	Priority,
	ComplaintCategory,
} from "@core/models";

@Component({
	selector: "app-admin-dashboard",
	template: `
		<div class="dashboard fade-in">
			<div class="page-header">
				<div>
					<h1>Admin Dashboard</h1>
					<p class="subtitle">Overview of all complaints and system metrics</p>
				</div>
				<a mat-flat-button color="primary" routerLink="/admin/analytics">
					<mat-icon>analytics</mat-icon>
					View Analytics
				</a>
			</div>

			<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

			<ng-container *ngIf="!isLoading">
				<!-- Overview Stats -->
				<div class="stats-grid">
					<mat-card class="stat-card">
						<mat-card-content>
							<div class="stat-icon total">
								<mat-icon>assignment</mat-icon>
							</div>
							<div class="stat-info">
								<span class="stat-value">{{
									analytics?.overview?.total_complaints || 0
								}}</span>
								<span class="stat-label">Total Complaints</span>
							</div>
						</mat-card-content>
					</mat-card>

					<mat-card class="stat-card">
						<mat-card-content>
							<div class="stat-icon pending">
								<mat-icon>hourglass_empty</mat-icon>
							</div>
							<div class="stat-info">
								<span class="stat-value">{{
									analytics?.overview?.pending_complaints || 0
								}}</span>
								<span class="stat-label">Unassigned</span>
							</div>
						</mat-card-content>
					</mat-card>

					<mat-card
						class="stat-card warning"
						*ngIf="(analytics?.overview?.overdue_complaints || 0) > 0"
					>
						<mat-card-content>
							<div class="stat-icon overdue">
								<mat-icon>warning</mat-icon>
							</div>
							<div class="stat-info">
								<span class="stat-value">{{
									analytics?.overview?.overdue_complaints || 0
								}}</span>
								<span class="stat-label">Overdue</span>
							</div>
						</mat-card-content>
					</mat-card>

					<mat-card class="stat-card">
						<mat-card-content>
							<div class="stat-icon sla">
								<mat-icon>speed</mat-icon>
							</div>
							<div class="stat-info">
								<span class="stat-value"
									>{{
										analytics?.overview?.sla_compliance_rate || 0
											| number : "1.0-0"
									}}%</span
								>
								<span class="stat-label">SLA Compliance</span>
							</div>
						</mat-card-content>
					</mat-card>

					<mat-card class="stat-card">
						<mat-card-content>
							<div class="stat-icon resolved">
								<mat-icon>check_circle</mat-icon>
							</div>
							<div class="stat-info">
								<span class="stat-value">{{
									analytics?.overview?.resolved_complaints || 0
								}}</span>
								<span class="stat-label">Resolved</span>
							</div>
						</mat-card-content>
					</mat-card>

					<mat-card class="stat-card">
						<mat-card-content>
							<div class="stat-icon time">
								<mat-icon>schedule</mat-icon>
							</div>
							<div class="stat-info">
								<span class="stat-value"
									>{{
										analytics?.overview?.average_resolution_hours || 0
											| number : "1.1-1"
									}}h</span
								>
								<span class="stat-label">Avg Resolution Time</span>
							</div>
						</mat-card-content>
					</mat-card>
				</div>

				<!-- Charts Row -->
				<div class="charts-row">
					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>By Status</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<div class="status-breakdown">
								<div
									*ngFor="let item of analytics?.by_status"
									class="status-item"
								>
									<div class="status-bar">
										<div
											class="status-fill"
											[ngClass]="'status-' + item.status"
											[style.width.%]="getPercentage(item.count)"
										></div>
									</div>
									<div class="status-label">
										<app-status-badge [status]="item.status"></app-status-badge>
										<span class="count">{{ item.count }}</span>
									</div>
								</div>
							</div>
						</mat-card-content>
					</mat-card>

					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>By Category</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<div class="category-breakdown">
								<div
									*ngFor="let item of analytics?.by_category"
									class="category-item"
								>
									<span class="category-name">{{
										item.category | categoryLabel
									}}</span>
									<div class="category-bar">
										<div
											class="category-fill"
											[style.width.%]="getPercentage(item.count)"
										></div>
									</div>
									<span class="category-count">{{ item.count }}</span>
								</div>
							</div>
						</mat-card-content>
					</mat-card>

					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>By Priority</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<div class="priority-breakdown">
								<div
									*ngFor="let item of analytics?.by_priority"
									class="priority-item"
								>
									<app-priority-badge
										[priority]="item.priority"
									></app-priority-badge>
									<span class="priority-count">{{ item.count }}</span>
								</div>
							</div>
						</mat-card-content>
					</mat-card>
				</div>

				<!-- Staff Performance -->
				<mat-card
					class="staff-card"
					*ngIf="analytics?.staff_performance?.length"
				>
					<mat-card-header>
						<mat-card-title>Staff Performance</mat-card-title>
						<a mat-button color="primary" routerLink="/admin/staff"
							>Manage Staff</a
						>
					</mat-card-header>
					<mat-card-content>
						<div class="table-responsive">
							<table
								mat-table
								[dataSource]="analytics?.staff_performance || []"
							>
								<ng-container matColumnDef="name">
									<th mat-header-cell *matHeaderCellDef>Staff Member</th>
									<td mat-cell *matCellDef="let row">{{ row.staff_name }}</td>
								</ng-container>

								<ng-container matColumnDef="resolved">
									<th mat-header-cell *matHeaderCellDef>Resolved</th>
									<td mat-cell *matCellDef="let row">
										{{ row.total_resolved }}
									</td>
								</ng-container>

								<ng-container matColumnDef="rating">
									<th mat-header-cell *matHeaderCellDef>Rating</th>
									<td mat-cell *matCellDef="let row">
										<app-star-rating
											[rating]="row.average_rating"
											[readonly]="true"
											[showLabel]="true"
										></app-star-rating>
									</td>
								</ng-container>

								<ng-container matColumnDef="avgTime">
									<th mat-header-cell *matHeaderCellDef>Avg. Resolution</th>
									<td mat-cell *matCellDef="let row">
										{{ row.average_resolution_hours | number : "1.1-1" }}h
									</td>
								</ng-container>

								<tr mat-header-row *matHeaderRowDef="staffColumns"></tr>
								<tr mat-row *matRowDef="let row; columns: staffColumns"></tr>
							</table>
						</div>
					</mat-card-content>
				</mat-card>

				<!-- Recent Overdue -->
				<mat-card class="overdue-card" *ngIf="overdueComplaints.length > 0">
					<mat-card-header>
						<mat-card-title class="warning-title">
							<mat-icon>warning</mat-icon>
							Overdue Complaints
						</mat-card-title>
					</mat-card-header>
					<mat-card-content>
						<div class="complaints-list">
							<div
								*ngFor="let complaint of overdueComplaints"
								class="complaint-item"
								[routerLink]="['/complaints', complaint.id]"
							>
								<div class="complaint-main">
									<h4>{{ complaint.title }}</h4>
									<div class="complaint-meta">
										<span class="meta-item">
											<mat-icon>person</mat-icon>
											<ng-container *ngIf="complaint.assigned_staff_name; else unassignedStaff">
												{{ complaint.assigned_staff_name }}
												<span class="staff-dept" *ngIf="complaint.assigned_staff_department">
													({{ complaint.assigned_staff_department }})
												</span>
											</ng-container>
											<ng-template #unassignedStaff>Unassigned</ng-template>
										</span>
										<span class="meta-item overdue-days">
											<mat-icon>error_outline</mat-icon>
											{{ getDaysOverdue(complaint.sla_deadline) }}d overdue
										</span>
									</div>
								</div>
								<app-priority-badge
									[priority]="complaint.priority"
								></app-priority-badge>
							</div>
						</div>
					</mat-card-content>
				</mat-card>
			</ng-container>
		</div>
	`,
	styles: [
		`
			.dashboard {
				max-width: 1400px;
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
				grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
				gap: 16px;
				margin-bottom: 24px;
			}

			.stat-card {
				transition: transform 0.2s, box-shadow 0.2s;
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

			.stat-icon.total {
				background: linear-gradient(135deg, #3f51b5, #303f9f);
			}

			.stat-icon.pending {
				background: linear-gradient(135deg, #ff9800, #f57c00);
			}

			.stat-icon.overdue {
				background: linear-gradient(135deg, #f44336, #d32f2f);
			}

			.stat-icon.sla {
				background: linear-gradient(135deg, #00bcd4, #0097a7);
			}

			.stat-icon.resolved {
				background: linear-gradient(135deg, #4caf50, #388e3c);
			}

			.stat-icon.time {
				background: linear-gradient(135deg, #9c27b0, #7b1fa2);
			}

			.stat-info {
				display: flex;
				flex-direction: column;
			}

			.stat-value {
				font-size: 1.5rem;
				font-weight: 600;
				line-height: 1;
			}

			.stat-label {
				color: var(--text-secondary);
				font-size: 0.75rem;
				margin-top: 4px;
			}

			.charts-row {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
				gap: 16px;
				margin-bottom: 24px;
			}

			.chart-card mat-card-header {
				padding: 16px 16px 0;
			}

			.status-breakdown,
			.category-breakdown {
				display: flex;
				flex-direction: column;
				gap: 12px;
			}

			.status-item,
			.category-item {
				display: flex;
				flex-direction: column;
				gap: 4px;
			}

			.status-bar,
			.category-bar {
				height: 8px;
				background: var(--border-color);
				border-radius: 4px;
				overflow: hidden;
			}

			.status-fill,
			.category-fill {
				height: 100%;
				border-radius: 4px;
				transition: width 0.3s ease;
			}

			.category-fill {
				background: linear-gradient(90deg, #3f51b5, #5c6bc0);
			}

			.status-fill.status-pending {
				background: #ff9800;
			}

			.status-fill.status-assigned {
				background: #2196f3;
			}

			.status-fill.status-in_progress {
				background: #9c27b0;
			}

			.status-fill.status-resolved {
				background: #4caf50;
			}

			.status-fill.status-rejected {
				background: #f44336;
			}

			.status-fill.status-closed {
				background: #607d8b;
			}

			.status-fill.status-escalated {
				background: #e91e63;
			}

			.status-label {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			.category-item {
				flex-direction: row;
				align-items: center;
				gap: 8px;
			}

			.category-name {
				width: 80px;
				font-size: 0.875rem;
			}

			.category-bar {
				flex: 1;
			}

			.category-count {
				width: 40px;
				text-align: right;
				font-weight: 500;
			}

			.priority-breakdown {
				display: flex;
				flex-wrap: wrap;
				gap: 16px;
			}

			.priority-item {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.priority-count {
				font-weight: 600;
				font-size: 1.25rem;
			}

			.staff-card mat-card-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 16px 16px 0;
			}

			.overdue-card {
				margin-top: 16px;
			}

			.warning-title {
				display: flex;
				align-items: center;
				gap: 8px;
				color: #f44336;
			}

			.warning-title mat-icon {
				color: #f44336;
			}

			.complaints-list {
				display: flex;
				flex-direction: column;
			}

			.complaint-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 12px 16px;
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

			.complaint-main h4 {
				margin: 0 0 4px;
				font-weight: 500;
			}

			.complaint-meta {
				display: flex;
				gap: 16px;
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

			.staff-dept {
				color: var(--text-tertiary);
				font-size: 0.7rem;
			}

			.overdue-days {
				color: #f44336 !important;
				font-weight: 500;
			}

			.overdue-days mat-icon {
				color: #f44336;
			}

			@media (max-width: 600px) {
				.page-header {
					flex-direction: column;
					align-items: stretch;
				}
			}
		`,
	],
})
export class AdminDashboardComponent implements OnInit {
	isLoading = true;
	analytics: AnalyticsData | null = null;
	overdueComplaints: Complaint[] = [];
	staffColumns = ["name", "resolved", "rating", "avgTime"];

	constructor(
		private analyticsService: AnalyticsService,
		private complaintService: ComplaintService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.loadData();
	}

	private loadData(): void {
		this.analyticsService.getAnalytics().subscribe({
			next: (data) => {
				this.analytics = data;
				this.loadOverdueComplaints();
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	private loadOverdueComplaints(): void {
		this.complaintService.getOverdueComplaints({ limit: 20 }).subscribe({
			next: (response) => {
				// Sort by priority (Critical first) then by days overdue (most overdue first)
				this.overdueComplaints = response.data
					.sort((a, b) => {
						const priorityOrder: Record<string, number> = {
							Critical: 0,
							High: 1,
							Medium: 2,
							Low: 3,
						};
						const priorityDiff =
							(priorityOrder[a.priority] ?? 4) -
							(priorityOrder[b.priority] ?? 4);
						if (priorityDiff !== 0) return priorityDiff;
						// Same priority - sort by days overdue descending
						return (
							this.getDaysOverdue(b.sla_deadline) -
							this.getDaysOverdue(a.sla_deadline)
						);
					})
					.slice(0, 5); // Take top 5 after sorting
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	getPercentage(count: number): number {
		const total = this.analytics?.overview?.total_complaints || 1;
		return (count / total) * 100;
	}

	getDaysOverdue(slaDeadline: string): number {
		const deadline = new Date(slaDeadline);
		const now = new Date();
		const diffMs = now.getTime() - deadline.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		return Math.max(0, diffDays);
	}
}
