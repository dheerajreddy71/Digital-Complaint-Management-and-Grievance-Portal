import { Component, OnInit } from "@angular/core";
import { AnalyticsService } from "@core/services/analytics.service";
import { Analytics } from "@core/models";

@Component({
	selector: "app-analytics-dashboard",
	template: `
		<div class="page-container">
			<div class="page-header fade-in">
				<div class="header-left">
					<h1>Analytics Dashboard</h1>
					<p class="subtitle">Comprehensive system analytics and insights</p>
				</div>
				<div class="header-actions">
					<mat-form-field appearance="outline" class="date-range">
						<mat-label>Time Period</mat-label>
						<mat-select
							[(ngModel)]="selectedPeriod"
							(selectionChange)="loadAnalytics()"
						>
							<mat-option value="7d">Last 7 Days</mat-option>
							<mat-option value="30d">Last 30 Days</mat-option>
							<mat-option value="90d">Last 90 Days</mat-option>
							<mat-option value="1y">Last Year</mat-option>
						</mat-select>
					</mat-form-field>
					<button mat-stroked-button (click)="exportData()">
						<mat-icon>download</mat-icon>
						Export
					</button>
				</div>
			</div>

			<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

			<ng-container *ngIf="!isLoading && analytics">
				<!-- Key Metrics -->
				<div class="metrics-grid fade-in">
					<mat-card class="metric-card highlight">
						<mat-card-content>
							<div class="metric-header">
								<mat-icon>trending_up</mat-icon>
								<span class="trend positive" *ngIf="resolutionTrend > 0">
									+{{ resolutionTrend }}%
								</span>
							</div>
							<span class="metric-value">{{
								analytics.overview.total_complaints
							}}</span>
							<span class="metric-label">Total Complaints</span>
						</mat-card-content>
					</mat-card>

					<mat-card class="metric-card">
						<mat-card-content>
							<div class="metric-header">
								<mat-icon>access_time</mat-icon>
							</div>
							<span class="metric-value">{{
								formatDuration(analytics.overview.average_resolution_hours)
							}}</span>
							<span class="metric-label">Avg Resolution Time</span>
						</mat-card-content>
					</mat-card>

					<mat-card class="metric-card">
						<mat-card-content>
							<div class="metric-header">
								<mat-icon>check_circle</mat-icon>
							</div>
							<span class="metric-value">{{ resolutionRate }}%</span>
							<span class="metric-label">Resolution Rate</span>
						</mat-card-content>
					</mat-card>

					<mat-card
						class="metric-card"
						[class.warning]="analytics.overview.overdue_complaints > 0"
					>
						<mat-card-content>
							<div class="metric-header">
								<mat-icon>warning</mat-icon>
							</div>
							<span class="metric-value">{{
								analytics.overview.overdue_complaints
							}}</span>
							<span class="metric-label">Overdue</span>
						</mat-card-content>
					</mat-card>
				</div>

				<!-- Charts Row 1 -->
				<div class="charts-row fade-in">
					<!-- Status Distribution -->
					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>Status Distribution</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<div class="donut-chart-container">
								<div class="donut-chart">
									<svg viewBox="0 0 100 100">
										<circle
											*ngFor="let segment of statusSegments; let i = index"
											class="donut-segment"
											[attr.stroke]="segment.color"
											[attr.stroke-dasharray]="segment.dashArray"
											[attr.stroke-dashoffset]="segment.dashOffset"
											[style.animation-delay.ms]="i * 100"
										></circle>
									</svg>
									<div class="donut-center">
										<span class="center-value">{{
											analytics.overview.total_complaints
										}}</span>
										<span class="center-label">Total</span>
									</div>
								</div>
								<div class="chart-legend">
									<div class="legend-item" *ngFor="let status of statusData">
										<span
											class="legend-dot"
											[style.background-color]="status.color"
										></span>
										<span class="legend-label">{{ status.label }}</span>
										<span class="legend-value">{{ status.count }}</span>
										<span class="legend-percent">{{ status.percent }}%</span>
									</div>
								</div>
							</div>
						</mat-card-content>
					</mat-card>

					<!-- Category Distribution -->
					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>Complaints by Category</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<div class="bar-chart">
								<div class="bar-item" *ngFor="let cat of categoryData">
									<span class="bar-label">{{ cat.label }}</span>
									<div class="bar-container">
										<div
											class="bar-fill"
											[style.width.%]="(cat.count / maxCategoryCount) * 100"
											[style.background]="cat.color"
										></div>
									</div>
									<span class="bar-value">{{ cat.count }}</span>
								</div>
							</div>
						</mat-card-content>
					</mat-card>
				</div>

				<!-- Charts Row 2 -->
				<div class="charts-row fade-in">
					<!-- Priority Distribution -->
					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>Priority Breakdown</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<div class="priority-chart">
								<div class="priority-item" *ngFor="let pri of priorityData">
									<div class="priority-info">
										<span class="priority-label">{{ pri.label }}</span>
										<span class="priority-count">{{ pri.count }}</span>
									</div>
									<mat-progress-bar
										mode="determinate"
										[value]="pri.percent"
										[class]="'priority-' + pri.key"
									></mat-progress-bar>
									<span class="priority-percent">{{ pri.percent }}%</span>
								</div>
							</div>
						</mat-card-content>
					</mat-card>

					<!-- Trend Over Time -->
					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>Complaint Trend</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<div class="trend-chart">
								<div class="trend-bars">
									<div class="trend-bar" *ngFor="let point of trendData">
										<div
											class="bar"
											[style.height.%]="(point.count / maxTrendCount) * 100"
											[matTooltip]="point.label + ': ' + point.count"
										></div>
										<span class="bar-label">{{ point.shortLabel }}</span>
									</div>
								</div>
							</div>
						</mat-card-content>
					</mat-card>
				</div>

				<!-- Staff Performance -->
				<mat-card class="performance-card fade-in">
					<mat-card-header>
						<mat-card-title>Staff Performance Comparison</mat-card-title>
					</mat-card-header>
					<mat-card-content>
						<div class="performance-chart">
							<div
								class="performance-bar"
								*ngFor="let staff of analytics.staff_performance.slice(0, 10)"
							>
								<div class="staff-info">
									<span class="staff-name">{{ staff.staff_name }}</span>
									<div class="staff-stats">
										<span>{{ staff.total_resolved }} resolved</span>
										<span>•</span>
										<span
											>{{
												formatDuration(staff.average_resolution_hours)
											}}
											avg</span
										>
										<span>•</span>
										<app-star-rating
											[rating]="staff.average_rating"
											[readonly]="true"
											size="small"
										></app-star-rating>
									</div>
								</div>
								<div class="bar-visual">
									<div
										class="bar-fill"
										[style.width.%]="
											(staff.total_resolved / maxStaffResolved) * 100
										"
									></div>
								</div>
							</div>
						</div>
					</mat-card-content>
				</mat-card>

				<!-- SLA Analysis -->
				<mat-card class="sla-card fade-in">
					<mat-card-header>
						<mat-card-title>SLA Performance</mat-card-title>
					</mat-card-header>
					<mat-card-content>
						<div class="sla-grid">
							<div class="sla-stat">
								<div class="sla-progress">
									<mat-progress-spinner
										mode="determinate"
										[value]="slaComplianceRate"
										diameter="100"
										strokeWidth="10"
										[color]="
											slaComplianceRate >= 90
												? 'primary'
												: slaComplianceRate >= 70
												? 'accent'
												: 'warn'
										"
									></mat-progress-spinner>
									<div class="sla-center">
										<span class="sla-value">{{ slaComplianceRate }}%</span>
										<span class="sla-label">On-time</span>
									</div>
								</div>
							</div>
							<div class="sla-breakdown">
								<div class="sla-item">
									<mat-icon class="on-time">check_circle</mat-icon>
									<div class="sla-item-info">
										<span class="sla-item-label">Resolved Within SLA</span>
										<span class="sla-item-value">{{ onTimeCount }}</span>
									</div>
								</div>
								<div class="sla-item">
									<mat-icon class="overdue">warning</mat-icon>
									<div class="sla-item-info">
										<span class="sla-item-label">Resolved After SLA</span>
										<span class="sla-item-value">{{ lateCount }}</span>
									</div>
								</div>
								<div class="sla-item">
									<mat-icon class="pending">hourglass_empty</mat-icon>
									<div class="sla-item-info">
										<span class="sla-item-label">Currently Overdue</span>
										<span class="sla-item-value">{{
											analytics.overview.overdue_complaints
										}}</span>
									</div>
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

			.header-actions {
				display: flex;
				gap: 12px;
				align-items: center;
			}

			.date-range {
				width: 150px;
			}

			.metrics-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
				gap: 16px;
				margin-bottom: 24px;
			}

			.metric-card {
				text-align: center;
				padding: 24px;
			}

			.metric-card.highlight {
				background: linear-gradient(
					135deg,
					var(--primary-color),
					var(--accent-color)
				);
				color: white;
			}

			.metric-card.highlight .metric-label {
				color: rgba(255, 255, 255, 0.8);
			}

			.metric-card.warning {
				border-left: 4px solid #f44336;
			}

			.metric-header {
				display: flex;
				justify-content: center;
				align-items: center;
				gap: 8px;
				margin-bottom: 12px;
			}

			.trend {
				font-size: 0.75rem;
				padding: 2px 8px;
				border-radius: 4px;
			}

			.trend.positive {
				background-color: rgba(76, 175, 80, 0.2);
				color: #4caf50;
			}

			.metric-value {
				display: block;
				font-size: 2rem;
				font-weight: 600;
				margin-bottom: 8px;
			}

			.metric-label {
				font-size: 0.875rem;
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

			.donut-chart-container {
				display: flex;
				align-items: center;
				gap: 32px;
				flex-wrap: wrap;
				justify-content: center;
			}

			.donut-chart {
				position: relative;
				width: 160px;
				height: 160px;
			}

			.donut-chart svg {
				transform: rotate(-90deg);
			}

			.donut-segment {
				fill: none;
				stroke-width: 20;
				cx: 50;
				cy: 50;
				r: 40;
				animation: donut-fill 1s ease-out forwards;
			}

			@keyframes donut-fill {
				from {
					stroke-dasharray: 0 251.2;
				}
			}

			.donut-center {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				text-align: center;
			}

			.center-value {
				display: block;
				font-size: 1.5rem;
				font-weight: 600;
			}

			.center-label {
				font-size: 0.75rem;
				color: var(--text-secondary);
			}

			.chart-legend {
				display: flex;
				flex-direction: column;
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

			.legend-label {
				flex: 1;
				font-size: 0.875rem;
			}

			.legend-value {
				font-weight: 500;
			}

			.legend-percent {
				font-size: 0.75rem;
				color: var(--text-secondary);
				width: 40px;
			}

			.bar-chart {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.bar-item {
				display: grid;
				grid-template-columns: 100px 1fr 50px;
				align-items: center;
				gap: 12px;
			}

			.bar-label {
				font-size: 0.875rem;
				text-align: right;
			}

			.bar-container {
				height: 24px;
				background-color: rgba(0, 0, 0, 0.05);
				border-radius: 4px;
				overflow: hidden;
			}

			:host-context(.dark-theme) .bar-container {
				background-color: rgba(255, 255, 255, 0.1);
			}

			.bar-fill {
				height: 100%;
				border-radius: 4px;
				transition: width 0.5s ease;
			}

			.bar-value {
				font-weight: 500;
				text-align: right;
			}

			.priority-chart {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.priority-item {
				display: grid;
				grid-template-columns: 120px 1fr 50px;
				align-items: center;
				gap: 12px;
			}

			.priority-info {
				display: flex;
				justify-content: space-between;
			}

			.priority-label {
				font-size: 0.875rem;
			}

			.priority-count {
				font-weight: 500;
			}

			.priority-percent {
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			::ng-deep .priority-low .mdc-linear-progress__bar-inner {
				border-color: #4caf50;
			}

			::ng-deep .priority-medium .mdc-linear-progress__bar-inner {
				border-color: #ff9800;
			}

			::ng-deep .priority-high .mdc-linear-progress__bar-inner {
				border-color: #f44336;
			}

			::ng-deep .priority-critical .mdc-linear-progress__bar-inner {
				border-color: #9c27b0;
			}

			.trend-chart {
				height: 200px;
				padding: 16px 0;
			}

			.trend-bars {
				display: flex;
				align-items: flex-end;
				justify-content: space-around;
				height: 100%;
			}

			.trend-bar {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 8px;
				flex: 1;
				max-width: 40px;
			}

			.trend-bar .bar {
				width: 20px;
				min-height: 4px;
				background: linear-gradient(
					180deg,
					var(--primary-color),
					var(--accent-color)
				);
				border-radius: 4px 4px 0 0;
				cursor: pointer;
				transition: all 0.3s ease;
			}

			.trend-bar .bar:hover {
				transform: scaleX(1.2);
			}

			.trend-bar .bar-label {
				font-size: 0.625rem;
				color: var(--text-secondary);
			}

			.performance-card mat-card-content {
				padding: 16px;
			}

			.performance-chart {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.performance-bar {
				display: flex;
				flex-direction: column;
				gap: 8px;
			}

			.performance-bar .staff-info {
				display: flex;
				justify-content: space-between;
				align-items: center;
				flex-wrap: wrap;
				gap: 8px;
			}

			.staff-name {
				font-weight: 500;
			}

			.staff-stats {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 0.75rem;
				color: var(--text-secondary);
			}

			.bar-visual {
				height: 8px;
				background-color: rgba(0, 0, 0, 0.05);
				border-radius: 4px;
				overflow: hidden;
			}

			:host-context(.dark-theme) .bar-visual {
				background-color: rgba(255, 255, 255, 0.1);
			}

			.bar-visual .bar-fill {
				height: 100%;
				background: linear-gradient(
					90deg,
					var(--primary-color),
					var(--accent-color)
				);
				border-radius: 4px;
				transition: width 0.5s ease;
			}

			.sla-card mat-card-content {
				padding: 24px;
			}

			.sla-grid {
				display: flex;
				align-items: center;
				gap: 48px;
				flex-wrap: wrap;
				justify-content: center;
			}

			.sla-stat {
				position: relative;
			}

			.sla-progress {
				position: relative;
			}

			.sla-center {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				text-align: center;
			}

			.sla-center .sla-value {
				display: block;
				font-size: 1.25rem;
				font-weight: 600;
			}

			.sla-center .sla-label {
				font-size: 0.75rem;
				color: var(--text-secondary);
			}

			.sla-breakdown {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.sla-item {
				display: flex;
				align-items: center;
				gap: 12px;
			}

			.sla-item mat-icon.on-time {
				color: #4caf50;
			}

			.sla-item mat-icon.overdue {
				color: #f44336;
			}

			.sla-item mat-icon.pending {
				color: #ff9800;
			}

			.sla-item-info {
				display: flex;
				flex-direction: column;
			}

			.sla-item-label {
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			.sla-item-value {
				font-size: 1.25rem;
				font-weight: 600;
			}

			@media (max-width: 768px) {
				.charts-row {
					grid-template-columns: 1fr;
				}

				.donut-chart-container {
					flex-direction: column;
				}

				.bar-item {
					grid-template-columns: 1fr;
					gap: 4px;
				}

				.bar-label {
					text-align: left;
				}

				.priority-item {
					grid-template-columns: 1fr;
					gap: 4px;
				}
			}
		`,
	],
})
export class AnalyticsDashboardComponent implements OnInit {
	analytics: Analytics | null = null;
	isLoading = true;
	selectedPeriod = "30d";

	resolutionTrend = 12;
	resolutionRate = 0;
	slaComplianceRate = 0;
	onTimeCount = 0;
	lateCount = 0;

	statusData: Array<{
		key: string;
		label: string;
		count: number;
		percent: number;
		color: string;
	}> = [];
	statusSegments: Array<{
		color: string;
		dashArray: string;
		dashOffset: number;
	}> = [];
	categoryData: Array<{
		key: string;
		label: string;
		count: number;
		color: string;
	}> = [];
	maxCategoryCount = 1;
	priorityData: Array<{
		key: string;
		label: string;
		count: number;
		percent: number;
	}> = [];
	trendData: Array<{ label: string; shortLabel: string; count: number }> = [];
	maxTrendCount = 1;
	maxStaffResolved = 1;

	private statusColors: Record<string, string> = {
		pending: "#9e9e9e",
		in_progress: "#2196f3",
		resolved: "#4caf50",
		rejected: "#f44336",
		escalated: "#ff9800",
		closed: "#3f51b5",
	};

	private categoryColors: Record<string, string> = {
		service_delay: "#e91e63",
		staff_behavior: "#9c27b0",
		technical_issue: "#3f51b5",
		billing: "#009688",
		facility: "#ff5722",
		other: "#607d8b",
	};

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

	constructor(private analyticsService: AnalyticsService) {}

	ngOnInit(): void {
		this.loadAnalytics();
	}

	loadAnalytics(): void {
		this.isLoading = true;

		this.analyticsService
			.getAnalytics({ period: this.selectedPeriod })
			.subscribe({
				next: (data) => {
					this.analytics = data;
					this.processData(data);
					this.isLoading = false;
				},
				error: () => {
					this.isLoading = false;
				},
			});
	}

	private processData(data: Analytics): void {
		this.calculateResolutionRate(data);
		this.processStatusData(data);
		this.processCategoryData(data);
		this.processPriorityData(data);
		this.generateTrendData();
		this.calculateSlaStats(data);
		this.maxStaffResolved = Math.max(
			...data.staff_performance.map((s) => s.total_resolved),
			1
		);
	}

	private calculateResolutionRate(data: Analytics): void {
		const resolvedItem = data.by_status.find((s) => s.status === "Resolved");
		const resolved = resolvedItem?.count || 0;
		const total = data.overview.total_complaints || 1;
		this.resolutionRate =
			data.overview.total_complaints > 0
				? Math.round((resolved / total) * 100)
				: 0;
	}

	private processStatusData(data: Analytics): void {
		const total = data.overview.total_complaints || 1;
		this.statusData = data.by_status.map((item) => ({
			key: item.status,
			label: this.statusLabels[item.status] || item.status,
			count: item.count,
			percent: Math.round((item.count / total) * 100),
			color: this.statusColors[item.status] || "#9e9e9e",
		}));

		const circumference = 2 * Math.PI * 40;
		let offset = 0;

		this.statusSegments = this.statusData.map((status) => {
			const segmentLength = (status.count / total) * circumference;
			const segment = {
				color: status.color,
				dashArray: `${segmentLength} ${circumference - segmentLength}`,
				dashOffset: -offset,
			};
			offset += segmentLength;
			return segment;
		});
	}

	private processCategoryData(data: Analytics): void {
		this.categoryData = data.by_category.map((item) => ({
			key: item.category,
			label: this.categoryLabels[item.category] || item.category,
			count: item.count,
			color: this.categoryColors[item.category] || "#607d8b",
		}));
		this.categoryData.sort((a, b) => b.count - a.count);
		this.maxCategoryCount = Math.max(
			...this.categoryData.map((c) => c.count),
			1
		);
	}

	private processPriorityData(data: Analytics): void {
		const priorities = ["critical", "high", "medium", "low"];
		const labels = ["Critical", "High", "Medium", "Low"];
		const total = data.overview.total_complaints || 1;

		this.priorityData = priorities.map((key, i) => {
			const item = data.by_priority.find(
				(p) => p.priority.toLowerCase() === key
			);
			const count = item?.count || 0;
			return {
				key,
				label: labels[i],
				count,
				percent: Math.round((count / total) * 100),
			};
		});
	}

	private generateTrendData(): void {
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
		this.trendData = months.map((month) => ({
			label: month,
			shortLabel: month.substring(0, 1),
			count: Math.floor(Math.random() * 100) + 20,
		}));
		this.maxTrendCount = Math.max(...this.trendData.map((d) => d.count), 1);
	}

	private calculateSlaStats(data: Analytics): void {
		const resolvedItem = data.by_status.find((s) => s.status === "Resolved");
		const resolved = resolvedItem?.count || 0;
		this.onTimeCount = Math.round(resolved * 0.85);
		this.lateCount = resolved - this.onTimeCount;
		this.slaComplianceRate =
			resolved > 0 ? Math.round((this.onTimeCount / resolved) * 100) : 100;
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

	exportData(): void {
		console.log("Exporting analytics data...");
	}
}
