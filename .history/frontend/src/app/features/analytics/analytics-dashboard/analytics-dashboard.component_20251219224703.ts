import { Component, OnInit, ViewChild } from "@angular/core";
import { AnalyticsService, AnalyticsData } from "@core/services/analytics.service";
import { SnackbarService } from "@core/services/snackbar.service";
import {
	ChartComponent,
	ApexChart,
	ApexAxisChartSeries,
	ApexXAxis,
	ApexDataLabels,
	ApexPlotOptions,
	ApexYAxis,
	ApexLegend,
	ApexFill,
	ApexGrid,
	ApexTooltip,
	ApexNonAxisChartSeries,
	ApexResponsive,
	ApexStroke,
} from "ng-apexcharts";

export type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	dataLabels: ApexDataLabels;
	plotOptions: ApexPlotOptions;
	xaxis: ApexXAxis;
	yaxis: ApexYAxis;
	legend: ApexLegend;
	fill: ApexFill;
	grid: ApexGrid;
	tooltip: ApexTooltip;
	stroke: ApexStroke;
	colors: string[];
};

export type PieChartOptions = {
	series: ApexNonAxisChartSeries;
	chart: ApexChart;
	labels: string[];
	colors: string[];
	legend: ApexLegend;
	dataLabels: ApexDataLabels;
	responsive: ApexResponsive[];
};

@Component({
	selector: "app-analytics-dashboard",
	template: `
		<div class="page-container">
			<div class="page-header fade-in">
				<h1>Analytics Dashboard</h1>
				<p class="subtitle">Comprehensive system insights and metrics</p>
			</div>

			<!-- Date Range Filter -->
			<mat-card class="filter-card fade-in">
				<div class="date-filters">
					<button
						mat-button
						[class.active]="selectedPeriod === '7days'"
						(click)="selectPeriod('7days')"
					>
						Last 7 Days
					</button>
					<button
						mat-button
						[class.active]="selectedPeriod === '30days'"
						(click)="selectPeriod('30days')"
					>
						Last 30 Days
					</button>
					<button
						mat-button
						[class.active]="selectedPeriod === '90days'"
						(click)="selectPeriod('90days')"
					>
						Last 90 Days
					</button>
					<button
						mat-button
						[class.active]="selectedPeriod === 'custom'"
						(click)="selectPeriod('custom')"
					>
						Custom Range
					</button>

					<div class="date-range" *ngIf="selectedPeriod === 'custom'">
						<mat-form-field appearance="outline">
							<mat-label>From Date</mat-label>
							<input
								matInput
								[matDatepicker]="pickerFrom"
								[(ngModel)]="dateFrom"
								(dateChange)="loadAnalytics()"
							/>
							<mat-datepicker-toggle
								matSuffix
								[for]="pickerFrom"
							></mat-datepicker-toggle>
							<mat-datepicker #pickerFrom></mat-datepicker>
						</mat-form-field>

						<mat-form-field appearance="outline">
							<mat-label>To Date</mat-label>
							<input
								matInput
								[matDatepicker]="pickerTo"
								[(ngModel)]="dateTo"
								(dateChange)="loadAnalytics()"
							/>
							<mat-datepicker-toggle
								matSuffix
								[for]="pickerTo"
							></mat-datepicker-toggle>
							<mat-datepicker #pickerTo></mat-datepicker>
						</mat-form-field>
					</div>

					<button mat-icon-button (click)="loadAnalytics()" matTooltip="Refresh">
						<mat-icon>refresh</mat-icon>
					</button>
				</div>
			</mat-card>

			<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

			<div class="analytics-content" *ngIf="!isLoading && analytics">
				<!-- Overview Stats -->
				<div class="stats-grid fade-in">
					<mat-card class="stat-card">
						<div class="stat-icon total">
							<mat-icon>inbox</mat-icon>
						</div>
						<div class="stat-content">
							<span class="stat-value">{{ analytics.overview.total_complaints }}</span>
							<span class="stat-label">Total Complaints</span>
						</div>
					</mat-card>

					<mat-card class="stat-card">
						<div class="stat-icon pending">
							<mat-icon>schedule</mat-icon>
						</div>
						<div class="stat-content">
							<span class="stat-value">{{
								analytics.overview.pending_complaints
							}}</span>
							<span class="stat-label">Pending</span>
						</div>
					</mat-card>

					<mat-card class="stat-card">
						<div class="stat-icon resolved">
							<mat-icon>check_circle</mat-icon>
						</div>
						<div class="stat-content">
							<span class="stat-value">{{
								analytics.overview.resolved_complaints
							}}</span>
							<span class="stat-label">Resolved</span>
						</div>
					</mat-card>

					<mat-card class="stat-card">
						<div class="stat-icon overdue">
							<mat-icon>warning</mat-icon>
						</div>
						<div class="stat-content">
							<span class="stat-value">{{
								analytics.overview.overdue_complaints
							}}</span>
							<span class="stat-label">Overdue</span>
						</div>
					</mat-card>

					<mat-card class="stat-card">
						<div class="stat-icon time">
							<mat-icon>access_time</mat-icon>
						</div>
						<div class="stat-content">
							<span class="stat-value"
								>{{ analytics.overview.average_resolution_hours | number : "1.1-1"
								}}h</span
							>
							<span class="stat-label">Avg. Resolution Time</span>
						</div>
					</mat-card>

					<mat-card class="stat-card">
						<div class="stat-icon sla">
							<mat-icon>speed</mat-icon>
						</div>
						<div class="stat-content">
							<span class="stat-value"
								>{{ analytics.overview.sla_compliance_rate | number : "1.0-0" }}%</span
							>
							<span class="stat-label">SLA Compliance</span>
						</div>
					</mat-card>
				</div>

				<!-- Charts Grid -->
				<div class="charts-grid fade-in">
					<!-- Status Distribution Pie Chart -->
					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>Status Distribution</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<apx-chart
								*ngIf="statusChartOptions"
								[series]="statusChartOptions.series"
								[chart]="statusChartOptions.chart"
								[labels]="statusChartOptions.labels"
								[colors]="statusChartOptions.colors"
								[legend]="statusChartOptions.legend"
								[dataLabels]="statusChartOptions.dataLabels"
								[responsive]="statusChartOptions.responsive"
							></apx-chart>
						</mat-card-content>
					</mat-card>

					<!-- Category Distribution Bar Chart -->
					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>Category Distribution</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<apx-chart
								*ngIf="categoryChartOptions"
								[series]="categoryChartOptions.series"
								[chart]="categoryChartOptions.chart"
								[dataLabels]="categoryChartOptions.dataLabels"
								[plotOptions]="categoryChartOptions.plotOptions"
								[xaxis]="categoryChartOptions.xaxis"
								[yaxis]="categoryChartOptions.yaxis"
								[colors]="categoryChartOptions.colors"
								[grid]="categoryChartOptions.grid"
								[tooltip]="categoryChartOptions.tooltip"
							></apx-chart>
						</mat-card-content>
					</mat-card>

					<!-- Priority Breakdown Donut Chart -->
					<mat-card class="chart-card">
						<mat-card-header>
							<mat-card-title>Priority Breakdown</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<apx-chart
								*ngIf="priorityChartOptions"
								[series]="priorityChartOptions.series"
								[chart]="priorityChartOptions.chart"
								[labels]="priorityChartOptions.labels"
								[colors]="priorityChartOptions.colors"
								[legend]="priorityChartOptions.legend"
								[dataLabels]="priorityChartOptions.dataLabels"
								[responsive]="priorityChartOptions.responsive"
							></apx-chart>
						</mat-card-content>
					</mat-card>

					<!-- Trends Line Chart (Full Width) -->
					<mat-card class="chart-card full-width">
						<mat-card-header>
							<mat-card-title>Complaint Trends (Last 30 Days)</mat-card-title>
						</mat-card-header>
						<mat-card-content>
							<apx-chart
								*ngIf="trendChartOptions"
								[series]="trendChartOptions.series"
								[chart]="trendChartOptions.chart"
								[dataLabels]="trendChartOptions.dataLabels"
								[stroke]="trendChartOptions.stroke"
								[xaxis]="trendChartOptions.xaxis"
								[yaxis]="trendChartOptions.yaxis"
								[colors]="trendChartOptions.colors"
								[grid]="trendChartOptions.grid"
								[tooltip]="trendChartOptions.tooltip"
								[fill]="trendChartOptions.fill"
							></apx-chart>
						</mat-card-content>
					</mat-card>
				</div>

				<!-- Staff Performance Table -->
				<mat-card class="table-card fade-in">
					<mat-card-header>
						<mat-card-title>Staff Performance</mat-card-title>
					</mat-card-header>
					<mat-card-content>
						<div class="table-container">
							<table mat-table [dataSource]="analytics.staff_performance">
								<ng-container matColumnDef="staff_name">
									<th mat-header-cell *matHeaderCellDef>Staff Member</th>
									<td mat-cell *matCellDef="let row">{{ row.staff_name }}</td>
								</ng-container>

								<ng-container matColumnDef="total_assigned">
									<th mat-header-cell *matHeaderCellDef>Assigned</th>
									<td mat-cell *matCellDef="let row">{{ row.total_assigned }}</td>
								</ng-container>

								<ng-container matColumnDef="total_resolved">
									<th mat-header-cell *matHeaderCellDef>Resolved</th>
									<td mat-cell *matCellDef="let row">{{ row.total_resolved }}</td>
								</ng-container>

								<ng-container matColumnDef="in_progress">
									<th mat-header-cell *matHeaderCellDef>In Progress</th>
									<td mat-cell *matCellDef="let row">{{ row.in_progress_count }}</td>
								</ng-container>

								<ng-container matColumnDef="overdue">
									<th mat-header-cell *matHeaderCellDef>Overdue</th>
									<td mat-cell *matCellDef="let row">
										<span
											class="overdue-badge"
											*ngIf="row.overdue_count > 0"
											[class.high]="row.overdue_count > 5"
										>
											{{ row.overdue_count }}
										</span>
										<span *ngIf="row.overdue_count === 0">-</span>
									</td>
								</ng-container>

								<ng-container matColumnDef="avg_resolution">
									<th mat-header-cell *matHeaderCellDef>Avg. Resolution Time</th>
									<td mat-cell *matCellDef="let row">
										{{ row.average_resolution_hours | number : "1.1-1" }}h
									</td>
								</ng-container>

								<ng-container matColumnDef="rating">
									<th mat-header-cell *matHeaderCellDef>Avg. Rating</th>
									<td mat-cell *matCellDef="let row">
										<div class="rating">
											<mat-icon class="star">star</mat-icon>
											{{ row.average_rating | number : "1.1-1" }}
										</div>
									</td>
								</ng-container>

								<tr mat-header-row *matHeaderRowDef="staffColumns"></tr>
								<tr mat-row *matRowDef="let row; columns: staffColumns"></tr>
							</table>
						</div>
					</mat-card-content>
				</mat-card>

				<!-- Top Locations -->
				<mat-card class="table-card fade-in">
					<mat-card-header>
						<mat-card-title>Most Affected Locations</mat-card-title>
					</mat-card-header>
					<mat-card-content>
						<div class="locations-list">
							<div
								*ngFor="let location of analytics.top_locations; let i = index"
								class="location-item"
							>
								<span class="rank">{{ i + 1 }}</span>
								<span class="location-name">{{ location.location }}</span>
								<span class="location-count">{{ location.count }} complaints</span>
							</div>
						</div>
					</mat-card-content>
				</mat-card>
			</div>
		</div>
	`,
	styles: [
		`
			.date-filters {
				display: flex;
				align-items: center;
				gap: 8px;
				flex-wrap: wrap;
			}

			.date-filters button.active {
				background-color: var(--primary-color);
				color: white;
			}

			.date-range {
				display: flex;
				gap: 16px;
				flex: 1;
			}

			.date-range mat-form-field {
				flex: 1;
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
				padding: 20px;
			}

			.stat-icon {
				width: 56px;
				height: 56px;
				border-radius: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.stat-icon mat-icon {
				font-size: 28px;
				width: 28px;
				height: 28px;
				color: white;
			}

			.stat-icon.total {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			}
			.stat-icon.pending {
				background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
			}
			.stat-icon.resolved {
				background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
			}
			.stat-icon.overdue {
				background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
			}
			.stat-icon.time {
				background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
			}
			.stat-icon.sla {
				background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
			}

			.stat-content {
				display: flex;
				flex-direction: column;
			}

			.stat-value {
				font-size: 1.75rem;
				font-weight: 600;
				color: var(--text-primary);
			}

			.stat-label {
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			.charts-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
				gap: 16px;
				margin-bottom: 24px;
			}

			.chart-card {
				padding: 0;
			}

			.chart-card.full-width {
				grid-column: 1 / -1;
			}

			.chart-card mat-card-header {
				padding: 16px 16px 0;
			}

			.chart-card mat-card-content {
				padding: 16px;
			}

			.table-card {
				margin-bottom: 16px;
			}

			.table-container {
				overflow-x: auto;
			}

			table {
				width: 100%;
			}

			.overdue-badge {
				display: inline-block;
				padding: 2px 8px;
				border-radius: 12px;
				background-color: rgba(244, 67, 54, 0.1);
				color: #f44336;
				font-weight: 500;
			}

			.overdue-badge.high {
				background-color: #f44336;
				color: white;
			}

			.rating {
				display: flex;
				align-items: center;
				gap: 4px;
			}

			.rating .star {
				color: #ffc107;
				font-size: 18px;
				width: 18px;
				height: 18px;
			}

			.locations-list {
				display: flex;
				flex-direction: column;
				gap: 12px;
			}

			.location-item {
				display: flex;
				align-items: center;
				gap: 12px;
				padding: 12px;
				background: var(--bg-hover);
				border-radius: 8px;
			}

			.rank {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 32px;
				height: 32px;
				border-radius: 50%;
				background: var(--primary-color);
				color: white;
				font-weight: 600;
			}

			.location-name {
				flex: 1;
				font-weight: 500;
			}

			.location-count {
				color: var(--text-secondary);
				font-size: 0.875rem;
			}

			@media (max-width: 768px) {
				.charts-grid {
					grid-template-columns: 1fr;
				}

				.stats-grid {
					grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
				}
			}
		`,
	],
})
export class AnalyticsDashboardComponent implements OnInit {
	analytics: AnalyticsData | null = null;
	isLoading = true;

	selectedPeriod: "7days" | "30days" | "90days" | "custom" = "30days";
	dateFrom: Date | null = null;
	dateTo: Date | null = null;

	statusChartOptions: Partial<PieChartOptions> | null = null;
	categoryChartOptions: Partial<ChartOptions> | null = null;
	priorityChartOptions: Partial<PieChartOptions> | null = null;
	trendChartOptions: Partial<ChartOptions> | null = null;

	staffColumns = [
		"staff_name",
		"total_assigned",
		"total_resolved",
		"in_progress",
		"overdue",
		"avg_resolution",
		"rating",
	];

	constructor(
		private analyticsService: AnalyticsService,
		private snackbar: SnackbarService
	) {}

	ngOnInit(): void {
		this.loadAnalytics();
	}

	selectPeriod(period: typeof this.selectedPeriod): void {
		this.selectedPeriod = period;

		if (period !== "custom") {
			this.dateFrom = null;
			this.dateTo = null;

			const now = new Date();
			const daysAgo =
				period === "7days" ? 7 : period === "30days" ? 30 : 90;

			this.dateFrom = new Date(now);
			this.dateFrom.setDate(now.getDate() - daysAgo);
			this.dateTo = now;

			this.loadAnalytics();
		}
	}

	loadAnalytics(): void {
		this.isLoading = true;

		this.analyticsService
			.getAnalytics(this.dateFrom || undefined, this.dateTo || undefined)
			.subscribe({
				next: (data) => {
					this.analytics = data;
					this.setupCharts();
					this.isLoading = false;
				},
				error: (error) => {
					this.snackbar.error("Failed to load analytics");
					this.isLoading = false;
				},
			});
	}

	private setupCharts(): void {
		if (!this.analytics) return;

		// Status Distribution Pie Chart
		this.statusChartOptions = {
			series: this.analytics.by_status.map((s) => s.count),
			chart: {
				type: "pie",
				height: 350,
			},
			labels: this.analytics.by_status.map((s) => s.status),
			colors: ["#667eea", "#f093fb", "#4facfe", "#fa709a", "#30cfd0"],
			legend: {
				position: "bottom",
			},
			dataLabels: {
				enabled: true,
				formatter: function (val: number) {
					return val.toFixed(0) + "%";
				},
			},
			responsive: [
				{
					breakpoint: 480,
					options: {
						chart: {
							height: 300,
						},
						legend: {
							position: "bottom",
						},
					},
				},
			],
		};

		// Category Distribution Bar Chart
		this.categoryChartOptions = {
			series: [
				{
					name: "Complaints",
					data: this.analytics.by_category.map((c) => c.count),
				},
			],
			chart: {
				type: "bar",
				height: 350,
				toolbar: {
					show: false,
				},
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: "55%",
					borderRadius: 8,
				},
			},
			dataLabels: {
				enabled: false,
			},
			xaxis: {
				categories: this.analytics.by_category.map((c) => c.category),
			},
			yaxis: {
				title: {
					text: "Number of Complaints",
				},
			},
			colors: ["#667eea"],
			grid: {
				borderColor: "#e7e7e7",
			},
			tooltip: {
				y: {
					formatter: function (val: number) {
						return val + " complaints";
					},
				},
			},
			stroke: {},
			fill: {},
			legend: {},
		};

		// Priority Breakdown Donut Chart
		this.priorityChartOptions = {
			series: this.analytics.by_priority.map((p) => p.count),
			chart: {
				type: "donut",
				height: 350,
			},
			labels: this.analytics.by_priority.map((p) => p.priority),
			colors: ["#f44336", "#ff9800", "#ffc107", "#4caf50"],
			legend: {
				position: "bottom",
			},
			dataLabels: {
				enabled: true,
			},
			responsive: [
				{
					breakpoint: 480,
					options: {
						chart: {
							height: 300,
						},
					},
				},
			],
		};

		// Trends Line Chart
		this.trendChartOptions = {
			series: [
				{
					name: "Complaints",
					data: this.analytics.trends.map((t) => t.count),
				},
			],
			chart: {
				type: "area",
				height: 350,
				toolbar: {
					show: true,
				},
				zoom: {
					enabled: true,
				},
			},
			dataLabels: {
				enabled: false,
			},
			stroke: {
				curve: "smooth",
				width: 2,
			},
			xaxis: {
				categories: this.analytics.trends.map((t) => t.date),
				labels: {
					formatter: function (val: string) {
						const date = new Date(val);
						return date.toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						});
					},
				},
			},
			yaxis: {
				title: {
					text: "Number of Complaints",
				},
			},
			colors: ["#667eea"],
			fill: {
				type: "gradient",
				gradient: {
					shadeIntensity: 1,
					opacityFrom: 0.7,
					opacityTo: 0.3,
					stops: [0, 90, 100],
				},
			},
			grid: {
				borderColor: "#e7e7e7",
			},
			tooltip: {
				x: {
					format: "MMM dd, yyyy",
				},
			},
			legend: {},
			plotOptions: {},
		};
	}
}
