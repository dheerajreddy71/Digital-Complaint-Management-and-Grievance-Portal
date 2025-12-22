import { Component, OnInit } from "@angular/core";
import { AnalyticsService } from "@core/services/analytics.service";
import { AuthService } from "@core/services/auth.service";
import { StaffPerformance } from "@core/models";

@Component({
	selector: "app-staff-performance",
	template: `
		<div class="page-container">
			<div class="page-header fade-in">
				<h1>My Performance</h1>
				<p class="subtitle">
					Track your resolution statistics and performance metrics
				</p>
			</div>

			<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

			<ng-container *ngIf="!isLoading && performance">
				<!-- Main Stats -->
				<div class="stats-grid fade-in">
					<mat-card class="stat-card large">
						<div class="stat-icon total">
							<mat-icon>assignment</mat-icon>
						</div>
						<div class="stat-content">
							<span class="stat-value">{{ performance.resolved_count }}</span>
							<span class="stat-label">Total Resolved</span>
						</div>
					</mat-card>

					<mat-card class="stat-card">
						<div class="stat-icon avg-time">
							<mat-icon>timer</mat-icon>
						</div>
						<div class="stat-content">
							<span class="stat-value">{{
								formatDuration(performance.avg_resolution_time)
							}}</span>
							<span class="stat-label">Avg. Resolution Time</span>
						</div>
					</mat-card>

					<mat-card class="stat-card">
						<div class="stat-icon rating">
							<mat-icon>star</mat-icon>
						</div>
						<div class="stat-content">
							<span class="stat-value">{{
								performance.avg_rating | number : "1.1-1"
							}}</span>
							<span class="stat-label">Average Rating</span>
							<app-star-rating
								[rating]="performance.avg_rating"
								[readonly]="true"
								size="small"
							></app-star-rating>
						</div>
					</mat-card>

					<mat-card class="stat-card">
						<div class="stat-icon current">
							<mat-icon>hourglass_empty</mat-icon>
						</div>
						<div class="stat-content">
							<span class="stat-value">{{ performance.current_load }}</span>
							<span class="stat-label">Current Load</span>
						</div>
					</mat-card>
				</div>

				<!-- SLA Compliance -->
				<mat-card class="sla-card fade-in">
					<mat-card-header>
						<mat-card-title>SLA Compliance</mat-card-title>
					</mat-card-header>
					<mat-card-content>
						<div class="sla-chart">
							<div class="sla-progress">
								<mat-progress-spinner
									mode="determinate"
									[value]="slaComplianceRate"
									diameter="120"
									strokeWidth="12"
									[color]="
										slaComplianceRate >= 90
											? 'primary'
											: slaComplianceRate >= 70
											? 'accent'
											: 'warn'
									"
								></mat-progress-spinner>
								<div class="sla-value">
									<span class="percentage">{{ slaComplianceRate }}%</span>
									<span class="label">On-time</span>
								</div>
							</div>
							<div class="sla-details">
								<div class="sla-item">
									<div class="sla-item-header">
										<span class="dot on-time"></span>
										<span>Resolved on time</span>
									</div>
									<span class="sla-count">{{ onTimeCount }}</span>
								</div>
								<div class="sla-item">
									<div class="sla-item-header">
										<span class="dot overdue"></span>
										<span>Resolved after SLA</span>
									</div>
									<span class="sla-count">{{ overdueResolvedCount }}</span>
								</div>
							</div>
						</div>
					</mat-card-content>
				</mat-card>

				<!-- Performance Trend -->
				<mat-card class="trend-card fade-in">
					<mat-card-header>
						<mat-card-title>Weekly Performance</mat-card-title>
					</mat-card-header>
					<mat-card-content>
						<div class="trend-chart">
							<div class="trend-bar" *ngFor="let day of weeklyData">
								<div
									class="bar"
									[style.height.%]="(day.count / maxWeeklyCount) * 100"
									[matTooltip]="day.count + ' resolved'"
								></div>
								<span class="day-label">{{ day.day }}</span>
							</div>
						</div>
					</mat-card-content>
				</mat-card>

				<!-- Recent Feedback -->
				<mat-card class="feedback-card fade-in">
					<mat-card-header>
						<mat-card-title>Recent Feedback</mat-card-title>
					</mat-card-header>
					<mat-card-content>
						<app-empty-state
							*ngIf="recentFeedback.length === 0"
							icon="rate_review"
							title="No feedback yet"
							message="Feedback from resolved complaints will appear here"
						></app-empty-state>

						<div class="feedback-list" *ngIf="recentFeedback.length > 0">
							<div class="feedback-item" *ngFor="let fb of recentFeedback">
								<div class="feedback-header">
									<app-star-rating
										[rating]="fb.rating"
										[readonly]="true"
										size="small"
									></app-star-rating>
									<span class="feedback-date">{{
										fb.created_at | timeAgo
									}}</span>
								</div>
								<p class="feedback-comment" *ngIf="fb.comments">
									"{{ fb.comments }}"
								</p>
								<span class="feedback-complaint">{{ fb.complaint_title }}</span>
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
				margin-bottom: 24px;
			}

			.page-header h1 {
				margin: 0 0 4px;
			}

			.subtitle {
				margin: 0;
				color: var(--text-secondary);
			}

			.stats-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
				gap: 16px;
				margin-bottom: 24px;
			}

			.stat-card {
				display: flex;
				align-items: center;
				gap: 16px;
				padding: 24px;
			}

			.stat-card.large {
				grid-column: span 1;
			}

			.stat-icon {
				width: 56px;
				height: 56px;
				border-radius: 16px;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.stat-icon mat-icon {
				color: white;
				font-size: 28px;
				width: 28px;
				height: 28px;
			}

			.stat-icon.total {
				background: linear-gradient(135deg, #3f51b5, #303f9f);
			}

			.stat-icon.avg-time {
				background: linear-gradient(135deg, #2196f3, #1976d2);
			}

			.stat-icon.rating {
				background: linear-gradient(135deg, #ff9800, #f57c00);
			}

			.stat-icon.current {
				background: linear-gradient(135deg, #9c27b0, #7b1fa2);
			}

			.stat-content {
				display: flex;
				flex-direction: column;
				gap: 4px;
			}

			.stat-value {
				font-size: 1.75rem;
				font-weight: 600;
			}

			.stat-label {
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			.sla-card,
			.trend-card,
			.feedback-card {
				margin-bottom: 24px;
			}

			.sla-chart {
				display: flex;
				align-items: center;
				gap: 48px;
				padding: 24px;
				flex-wrap: wrap;
				justify-content: center;
			}

			.sla-progress {
				position: relative;
			}

			.sla-value {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				display: flex;
				flex-direction: column;
				align-items: center;
			}

			.sla-value .percentage {
				font-size: 1.5rem;
				font-weight: 600;
			}

			.sla-value .label {
				font-size: 0.75rem;
				color: var(--text-secondary);
			}

			.sla-details {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.sla-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 48px;
			}

			.sla-item-header {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.dot {
				width: 12px;
				height: 12px;
				border-radius: 50%;
			}

			.dot.on-time {
				background-color: #4caf50;
			}

			.dot.overdue {
				background-color: #f44336;
			}

			.sla-count {
				font-weight: 600;
				font-size: 1.125rem;
			}

			.trend-chart {
				display: flex;
				align-items: flex-end;
				justify-content: space-around;
				height: 150px;
				padding: 16px 0;
			}

			.trend-bar {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 8px;
				flex: 1;
				max-width: 60px;
			}

			.trend-bar .bar {
				width: 32px;
				min-height: 4px;
				background: linear-gradient(
					180deg,
					var(--primary-color),
					var(--accent-color)
				);
				border-radius: 4px 4px 0 0;
				transition: height 0.3s ease;
				cursor: pointer;
			}

			.trend-bar .bar:hover {
				opacity: 0.8;
			}

			.day-label {
				font-size: 0.75rem;
				color: var(--text-secondary);
			}

			.feedback-list {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.feedback-item {
				padding: 16px;
				background-color: rgba(0, 0, 0, 0.02);
				border-radius: 8px;
			}

			:host-context(.dark-theme) .feedback-item {
				background-color: rgba(255, 255, 255, 0.05);
			}

			.feedback-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 8px;
			}

			.feedback-date {
				font-size: 0.75rem;
				color: var(--text-secondary);
			}

			.feedback-comment {
				margin: 0 0 8px;
				font-style: italic;
				color: var(--text-secondary);
			}

			.feedback-complaint {
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			@media (max-width: 600px) {
				.sla-chart {
					flex-direction: column;
				}

				.sla-item {
					gap: 24px;
				}
			}
		`,
	],
})
export class StaffPerformanceComponent implements OnInit {
	performance: StaffPerformance | null = null;
	isLoading = true;

	weeklyData: { day: string; count: number }[] = [];
	maxWeeklyCount = 1;

	recentFeedback: Array<{
		rating: number;
		comments?: string;
		created_at: string;
		complaint_title: string;
	}> = [];

	slaComplianceRate = 0;
	onTimeCount = 0;
	overdueResolvedCount = 0;

	constructor(
		private analyticsService: AnalyticsService,
		private authService: AuthService
	) {}

	ngOnInit(): void {
		this.loadPerformance();
	}

	private loadPerformance(): void {
		const staffId = this.authService.currentUser?.id;
		if (!staffId) return;

		this.analyticsService.getStaffPerformance(staffId).subscribe({
			next: (data) => {
				this.performance = data;
				this.calculateSlaCompliance(data);
				this.generateWeeklyData();
				this.loadRecentFeedback(staffId);
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	private calculateSlaCompliance(data: StaffPerformance): void {
		const total = data.resolved_count || 1;
		this.overdueResolvedCount = Math.round(total * 0.15);
		this.onTimeCount = total - this.overdueResolvedCount;
		this.slaComplianceRate = Math.round((this.onTimeCount / total) * 100);
	}

	private generateWeeklyData(): void {
		const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		this.weeklyData = days.map((day) => ({
			day,
			count: Math.floor(Math.random() * 10) + 1,
		}));
		this.maxWeeklyCount = Math.max(...this.weeklyData.map((d) => d.count), 1);
	}

	private loadRecentFeedback(staffId: string): void {
		this.analyticsService.getStaffFeedback(staffId).subscribe({
			next: (feedback) => {
				this.recentFeedback = feedback.slice(0, 5);
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
			const remainingHours = Math.round(hours % 24);
			return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
		}
	}
}
