import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { UserService } from "@core/services/user.service";
import { AnalyticsService } from "@core/services/analytics.service";
import { SnackbarService } from "@core/services/snackbar.service";
import { User, StaffPerformance, AvailabilityStatus } from "@core/models";

@Component({
	selector: "app-staff-management",
	template: `
		<div class="page-container">
			<div class="page-header fade-in">
				<div class="header-left">
					<h1>Staff Management</h1>
					<p class="subtitle">Monitor staff performance and workload</p>
				</div>
			</div>

			<!-- Summary Cards -->
			<div class="summary-cards fade-in">
				<mat-card class="summary-card">
					<div class="summary-icon total">
						<mat-icon>groups</mat-icon>
					</div>
					<div class="summary-content">
						<span class="summary-value">{{ totalStaff }}</span>
						<span class="summary-label">Total Staff</span>
					</div>
				</mat-card>

				<mat-card class="summary-card">
					<div class="summary-icon available">
						<mat-icon>check_circle</mat-icon>
					</div>
					<div class="summary-content">
						<span class="summary-value">{{ availableStaff }}</span>
						<span class="summary-label">Available</span>
					</div>
				</mat-card>

				<mat-card class="summary-card">
					<div class="summary-icon busy">
						<mat-icon>hourglass_empty</mat-icon>
					</div>
					<div class="summary-content">
						<span class="summary-value">{{ busyStaff }}</span>
						<span class="summary-label">Busy (>10 complaints)</span>
					</div>
				</mat-card>

				<mat-card class="summary-card">
					<div class="summary-icon rating">
						<mat-icon>star</mat-icon>
					</div>
					<div class="summary-content">
						<span class="summary-value">{{
							avgTeamRating | number : "1.1-1"
						}}</span>
						<span class="summary-label">Avg Team Rating</span>
					</div>
				</mat-card>
			</div>

			<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

			<!-- Staff Table -->
			<mat-card class="table-card fade-in" *ngIf="!isLoading">
				<mat-card-header>
					<mat-card-title>Staff Performance</mat-card-title>
					<div class="header-actions">
						<mat-form-field appearance="outline" class="search-field">
							<mat-label>Search staff</mat-label>
							<mat-icon matPrefix>search</mat-icon>
							<input
								matInput
								(keyup)="applyFilter($event)"
								placeholder="Search by name"
							/>
						</mat-form-field>
					</div>
				</mat-card-header>

				<div class="table-container">
					<table mat-table [dataSource]="dataSource" matSort>
						<ng-container matColumnDef="name">
							<th mat-header-cell *matHeaderCellDef mat-sort-header>
								Staff Member
							</th>
							<td mat-cell *matCellDef="let staff">
								<div class="staff-cell">
									<div
										class="staff-avatar"
										[class.available]="staff.is_available"
									>
										{{ staff.name.charAt(0).toUpperCase() }}
									</div>
									<div class="staff-info">
										<span class="staff-name">{{ staff.name }}</span>
										<span
											class="availability-badge"
											[class.available]="staff.is_available"
										>
											{{ staff.is_available ? "Available" : "Unavailable" }}
										</span>
									</div>
								</div>
							</td>
						</ng-container>

						<ng-container matColumnDef="current_load">
							<th mat-header-cell *matHeaderCellDef mat-sort-header>
								Current Load
							</th>
							<td mat-cell *matCellDef="let staff">
								<div class="load-indicator">
									<mat-progress-bar
										mode="determinate"
										[value]="(staff.current_load / 15) * 100"
										[color]="getLoadColor(staff.current_load)"
									></mat-progress-bar>
									<span class="load-value">{{ staff.current_load }}</span>
								</div>
							</td>
						</ng-container>

						<ng-container matColumnDef="resolved_count">
							<th mat-header-cell *matHeaderCellDef mat-sort-header>
								Total Resolved
							</th>
							<td mat-cell *matCellDef="let staff">
								<span class="resolved-count">{{ staff.resolved_count }}</span>
							</td>
						</ng-container>

						<ng-container matColumnDef="avg_resolution_time">
							<th mat-header-cell *matHeaderCellDef mat-sort-header>
								Avg Resolution Time
							</th>
							<td mat-cell *matCellDef="let staff">
								{{ formatDuration(staff.avg_resolution_time) }}
							</td>
						</ng-container>

						<ng-container matColumnDef="avg_rating">
							<th mat-header-cell *matHeaderCellDef mat-sort-header>Rating</th>
							<td mat-cell *matCellDef="let staff">
								<div class="rating-cell">
									<app-star-rating
										[rating]="staff.avg_rating"
										[readonly]="true"
										size="small"
									></app-star-rating>
									<span class="rating-value">{{
										staff.avg_rating | number : "1.1-1"
									}}</span>
								</div>
							</td>
						</ng-container>

						<ng-container matColumnDef="actions">
							<th mat-header-cell *matHeaderCellDef>Actions</th>
							<td mat-cell *matCellDef="let staff">
								<button
									mat-icon-button
									matTooltip="Toggle Availability"
									(click)="toggleAvailability(staff)"
								>
									<mat-icon>{{
										staff.is_available ? "toggle_on" : "toggle_off"
									}}</mat-icon>
								</button>
								<button
									mat-icon-button
									matTooltip="View Details"
									(click)="viewDetails(staff)"
								>
									<mat-icon>visibility</mat-icon>
								</button>
							</td>
						</ng-container>

						<tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
						<tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
					</table>
				</div>

				<mat-paginator
					[pageSizeOptions]="[10, 25, 50]"
					showFirstLastButtons
				></mat-paginator>
			</mat-card>

			<!-- Staff Detail Dialog -->
			<ng-template #staffDetailDialog let-staff>
				<h2 mat-dialog-title>{{ staff.name }}</h2>
				<mat-dialog-content>
					<div class="detail-grid">
						<div class="detail-item">
							<span class="detail-label">Email</span>
							<span class="detail-value">{{ staff.email }}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Phone</span>
							<span class="detail-value">{{
								staff.phone || "Not provided"
							}}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Joined</span>
							<span class="detail-value">{{
								staff.created_at | date : "mediumDate"
							}}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Current Load</span>
							<span class="detail-value"
								>{{ staff.current_load }} complaints</span
							>
						</div>
						<div class="detail-item">
							<span class="detail-label">Total Resolved</span>
							<span class="detail-value">{{ staff.resolved_count }}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Avg Resolution Time</span>
							<span class="detail-value">{{
								formatDuration(staff.avg_resolution_time)
							}}</span>
						</div>
						<div class="detail-item full-width">
							<span class="detail-label">Rating</span>
							<div class="rating-display">
								<app-star-rating
									[rating]="staff.avg_rating"
									[readonly]="true"
								></app-star-rating>
								<span>{{ staff.avg_rating | number : "1.1-1" }} / 5</span>
							</div>
						</div>
					</div>
				</mat-dialog-content>
				<mat-dialog-actions align="end">
					<button mat-button mat-dialog-close>Close</button>
				</mat-dialog-actions>
			</ng-template>
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

			.summary-cards {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
				gap: 16px;
				margin-bottom: 24px;
			}

			.summary-card {
				display: flex;
				align-items: center;
				gap: 16px;
				padding: 20px;
			}

			.summary-icon {
				width: 48px;
				height: 48px;
				border-radius: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.summary-icon mat-icon {
				color: white;
			}

			.summary-icon.total {
				background: linear-gradient(135deg, #3f51b5, #303f9f);
			}

			.summary-icon.available {
				background: linear-gradient(135deg, #4caf50, #388e3c);
			}

			.summary-icon.busy {
				background: linear-gradient(135deg, #ff9800, #f57c00);
			}

			.summary-icon.rating {
				background: linear-gradient(135deg, #ffc107, #ffa000);
			}

			.summary-content {
				display: flex;
				flex-direction: column;
			}

			.summary-value {
				font-size: 1.5rem;
				font-weight: 600;
			}

			.summary-label {
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			.table-card mat-card-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				flex-wrap: wrap;
				gap: 16px;
				padding: 16px;
			}

			.search-field {
				min-width: 250px;
			}

			.table-container {
				overflow-x: auto;
			}

			table {
				width: 100%;
			}

			.staff-cell {
				display: flex;
				align-items: center;
				gap: 12px;
			}

			.staff-avatar {
				width: 40px;
				height: 40px;
				border-radius: 50%;
				background: linear-gradient(135deg, #9e9e9e, #757575);
				display: flex;
				align-items: center;
				justify-content: center;
				color: white;
				font-weight: 500;
			}

			.staff-avatar.available {
				background: linear-gradient(135deg, #4caf50, #388e3c);
			}

			.staff-info {
				display: flex;
				flex-direction: column;
				gap: 4px;
			}

			.staff-name {
				font-weight: 500;
			}

			.availability-badge {
				font-size: 0.625rem;
				text-transform: uppercase;
				padding: 2px 6px;
				border-radius: 4px;
				background-color: rgba(244, 67, 54, 0.15);
				color: #f44336;
				width: fit-content;
			}

			.availability-badge.available {
				background-color: rgba(76, 175, 80, 0.15);
				color: #4caf50;
			}

			.load-indicator {
				display: flex;
				align-items: center;
				gap: 12px;
				min-width: 120px;
			}

			.load-indicator mat-progress-bar {
				flex: 1;
			}

			.load-value {
				font-weight: 500;
				min-width: 24px;
			}

			.resolved-count {
				font-weight: 500;
			}

			.rating-cell {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.rating-value {
				font-weight: 500;
			}

			.detail-grid {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 16px;
				min-width: 400px;
			}

			.detail-item {
				display: flex;
				flex-direction: column;
				gap: 4px;
			}

			.detail-item.full-width {
				grid-column: span 2;
			}

			.detail-label {
				font-size: 0.75rem;
				color: var(--text-secondary);
				text-transform: uppercase;
			}

			.detail-value {
				font-weight: 500;
			}

			.rating-display {
				display: flex;
				align-items: center;
				gap: 12px;
			}

			@media (max-width: 600px) {
				.table-card mat-card-header {
					flex-direction: column;
					align-items: stretch;
				}

				.search-field {
					min-width: 100%;
				}

				.detail-grid {
					grid-template-columns: 1fr;
					min-width: auto;
				}

				.detail-item.full-width {
					grid-column: span 1;
				}
			}
		`,
	],
})
export class StaffManagementComponent implements OnInit {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild("staffDetailDialog") staffDetailDialog: any;

	dataSource = new MatTableDataSource<StaffPerformance & User>([]);
	displayedColumns = [
		"name",
		"current_load",
		"resolved_count",
		"avg_resolution_time",
		"avg_rating",
		"actions",
	];

	isLoading = true;

	totalStaff = 0;
	availableStaff = 0;
	busyStaff = 0;
	avgTeamRating = 0;

	private staffList: (StaffPerformance & User)[] = [];

	constructor(
		private userService: UserService,
		private analyticsService: AnalyticsService,
		private snackbar: SnackbarService
	) {}

	ngOnInit(): void {
		this.loadStaffData();
	}

	private loadStaffData(): void {
		this.userService.getStaffList().subscribe({
			next: (staff) => {
				this.analyticsService.getAnalytics().subscribe({
					next: (analytics) => {
						this.staffList = staff.map((s) => {
							const perf = analytics.staff_performance.find(
								(p) => p.staff_id === s.id
							);

							// Create a StaffPerformance object from StaffPerformanceMetrics
							const staffPerf: StaffPerformance = {
								staff_id: s.id,
								staff_name: s.name,
								total_assigned: 0,
								resolved_count: perf?.total_resolved || 0,
								in_progress_count: 0,
								overdue_count: 0,
								avg_rating: perf?.average_rating || 0,
								sla_compliance_rate: 0,
								average_resolution_hours: perf?.average_resolution_hours || 0,
							};

							return {
								...s,
								...staffPerf,
								is_available:
									s.availability_status === AvailabilityStatus.AVAILABLE,
							};
						});
						this.staffList = this.staffList;
						this.dataSource.data = this.staffList;
						this.dataSource.paginator = this.paginator;
						this.dataSource.sort = this.sort;

						this.calculateSummary();
						this.isLoading = false;
					},
					error: () => {
						this.isLoading = false;
					},
				});
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	private calculateSummary(): void {
		this.totalStaff = this.staffList.length;
		this.availableStaff = this.staffList.filter(
			(s) => s.availability_status === AvailabilityStatus.AVAILABLE
		).length;
		this.busyStaff = this.staffList.filter(
			(s) => s.in_progress_count && s.in_progress_count > 5
		).length;

		const ratings = this.staffList
			.filter((s) => s.avg_rating > 0)
			.map((s) => s.avg_rating);
		this.avgTeamRating =
			ratings.length > 0
				? ratings.reduce((a, b) => a + b, 0) / ratings.length
				: 0;
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	getLoadColor(load: number): "primary" | "accent" | "warn" {
		if (load <= 5) return "primary";
		if (load <= 10) return "accent";
		return "warn";
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

	toggleAvailability(staff: StaffPerformance & User): void {
		const newAvailability =
			staff.availability_status !== AvailabilityStatus.AVAILABLE;

		this.userService
			.updateAvailability(newAvailability, String(staff.id))
			.subscribe({
				next: () => {
					staff.availability_status = newAvailability
						? AvailabilityStatus.AVAILABLE
						: AvailabilityStatus.OFFLINE;
					this.calculateSummary();
					this.snackbar.success(
						`${staff.name} is now ${
							newAvailability ? "available" : "unavailable"
						}`
					);
				},
			});
	}

	viewDetails(staff: StaffPerformance & User): void {
		// For now, just log - in real app would open dialog
		console.log("View details for:", staff);
	}
}
