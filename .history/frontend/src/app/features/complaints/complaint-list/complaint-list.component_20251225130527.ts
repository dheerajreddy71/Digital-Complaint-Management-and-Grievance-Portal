import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { PageEvent } from "@angular/material/paginator";
import { ComplaintService } from "@core/services/complaint.service";
import { AuthService } from "@core/services/auth.service";
import { SnackbarService } from "@core/services/snackbar.service";
import {
	Complaint,
	ComplaintFilters,
	PaginatedResponse,
	ComplaintStatus,
	Priority,
	ComplaintCategory,
	UserRole,
} from "@core/models";
import { environment } from "@environments/environment";

@Component({
	selector: "app-complaint-list",
	template: `
		<div class="page-container fade-in">
			<div class="page-header">
				<div class="header-title">
					<h1>{{ pageTitle }}</h1>
				</div>
				<button
					mat-flat-button
					color="primary"
					routerLink="/complaints/new"
					*ngIf="authService.currentUser?.role === UserRole.USER"
				>
					<mat-icon>add</mat-icon>
					New Complaint
				</button>
			</div>

			<!-- Filters -->
			<app-complaint-filters
				[filters]="filters"
				[showUserFilter]="authService.currentUser?.role !== UserRole.USER"
				(filtersChange)="onFiltersChange($event)"
			></app-complaint-filters>

			<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

			<ng-container *ngIf="!isLoading">
				<app-empty-state
					*ngIf="complaints.length === 0"
					icon="report_problem"
					title="No complaints found"
					[message]="emptyMessage"
				>
					<button
						mat-flat-button
						color="primary"
						routerLink="/complaints/new"
						*ngIf="authService.currentUser?.role === UserRole.USER"
					>
						Create your first complaint
					</button>
				</app-empty-state>

				<div class="complaints-grid" *ngIf="complaints.length > 0">
					<mat-card
						*ngFor="let complaint of complaints"
						class="complaint-card"
						[class.overdue]="complaint.is_overdue"
						(click)="viewComplaint(complaint.id)"
					>
						<mat-card-header>
							<div class="card-header-content">
								<div class="badges">
									<app-status-badge
										[status]="complaint.status"
									></app-status-badge>
									<app-priority-badge
										[priority]="complaint.priority"
									></app-priority-badge>
								</div>
								<app-sla-indicator
									*ngIf="showSla(complaint)"
									[slaDeadline]="complaint.sla_deadline"
									[isOverdue]="complaint.is_overdue"
								></app-sla-indicator>
							</div>
						</mat-card-header>

						<mat-card-content>
							<h3 class="complaint-title">{{ complaint.title }}</h3>
							<p class="complaint-desc">
								{{ complaint.description | truncate : 120 }}
							</p>

							<div class="complaint-meta">
								<span
									class="meta-item"
									*ngIf="authService.currentUser?.role !== UserRole.USER"
								>
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

							<div class="assigned-to" *ngIf="complaint.assigned_staff_name">
								<mat-icon>assignment_ind</mat-icon>
								<span>{{ complaint.assigned_staff_name }}</span>
							</div>

							<div
								class="pick-up-action"
								*ngIf="
									!complaint.assigned_to &&
									complaint.status === 'Open' &&
									authService.currentUser?.role === UserRole.STAFF
								"
							>
								<button
									mat-raised-button
									color="primary"
									(click)="pickUpComplaint($event, complaint.id)"
									[disabled]="isPickingUp === complaint.id"
								>
									<mat-icon>assignment_turned_in</mat-icon>
									{{
										isPickingUp === complaint.id ? "Picking up..." : "Pick Up"
									}}
								</button>
							</div>
						</mat-card-content>
					</mat-card>
				</div>

				<mat-paginator
					*ngIf="pagination.total > 0"
					[length]="pagination.total"
					[pageSize]="pagination.limit"
					[pageSizeOptions]="pageSizeOptions"
					[pageIndex]="pagination.page - 1"
					(page)="onPageChange($event)"
					showFirstLastButtons
				></mat-paginator>
			</ng-container>
		</div>
	`,
	styles: [
		`
			.page-container {
				max-width: 1400px;
				margin: 0 auto;
				padding: 24px;
			}

			.page-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 24px;
				gap: 16px;
			}

			.header-title h1 {
				margin: 0;
				font-size: 1.75rem;
			}

			.complaints-grid {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
				gap: 20px;
				margin: 24px 0;
			}

			.complaint-card {
				cursor: pointer;
				transition: transform 0.2s, box-shadow 0.2s;
			}

			.complaint-card:hover {
				transform: translateY(-2px);
				box-shadow: var(--shadow-md);
			}

			.complaint-card.overdue {
				border-left: 4px solid #f44336;
			}

			.card-header-content {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;
			}

			.badges {
				display: flex;
				gap: 8px;
			}

			.complaint-title {
				margin: 0 0 8px;
				font-size: 1rem;
				font-weight: 500;
				line-height: 1.4;
			}

			.complaint-desc {
				margin: 0 0 12px;
				color: var(--text-secondary);
				font-size: 0.875rem;
				line-height: 1.5;
			}

			.complaint-meta {
				display: flex;
				flex-wrap: wrap;
				gap: 12px;
				margin-bottom: 8px;
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

			.assigned-to {
				display: flex;
				align-items: center;
				gap: 4px;
				padding-top: 8px;
				border-top: 1px solid var(--border-color);
				font-size: 0.875rem;
				color: var(--text-secondary);
			}

			.assigned-to mat-icon {
				font-size: 16px;
				width: 16px;
				height: 16px;
				color: #3f51b5;
			}

			.pick-up-action {
				margin-top: 12px;
				padding-top: 12px;
				border-top: 1px solid var(--border-color);
			}

			.pick-up-action button {
				width: 100%;
			}

			.pick-up-action mat-icon {
				margin-right: 8px;
			}

			mat-paginator {
				background: transparent;
			}

			@media (max-width: 600px) {
				.complaints-grid {
					grid-template-columns: 1fr;
				}

				.page-header {
					flex-direction: column;
					align-items: stretch;
				}

				.page-header button {
					width: 100%;
				}
			}
		`,
	],
})
export class ComplaintListComponent implements OnInit {
	complaints: Complaint[] = [];
	isLoading = true;
	isPickingUp: string | null = null;
	pageTitle = "My Complaints";
	emptyMessage = "You haven't submitted any complaints yet.";
	pageSizeOptions = environment.pageSizeOptions;

	filters: ComplaintFilters = {
		page: 1,
		limit: environment.defaultPageSize,
	};

	pagination = {
		page: 1,
		limit: environment.defaultPageSize,
		total: 0,
		totalPages: 0,
	};

	constructor(
		public authService: AuthService,
		private complaintService: ComplaintService,
		private router: Router,
		private route: ActivatedRoute
	) {}

	UserRole = UserRole; // Expose enum to template

	ngOnInit(): void {
		this.setPageContext();
		this.loadComplaints();
	}

	private setPageContext(): void {
		const role = this.authService.currentUser?.role;
		if (role === "Admin") {
			this.pageTitle = "All Complaints";
			this.emptyMessage = "No complaints have been submitted yet.";
		} else if (role === "Staff") {
			this.pageTitle = "Complaints";
			this.emptyMessage =
				"No complaints from your department or assigned to you.";
			// For staff, request all complaints (department + assigned)
			this.filters = { ...this.filters, all: "true" };
		}
	}

	private loadComplaints(): void {
		this.isLoading = true;
		const role = this.authService.currentUser?.role;

		let request$;
		if (role === UserRole.USER) {
			request$ = this.complaintService.getMyComplaints(this.filters);
		} else {
			request$ = this.complaintService.getComplaints(this.filters);
		}

		request$.subscribe({
			next: (response) => {
				this.complaints = response.data;
				this.pagination = {
					page: response.pagination?.page || 1,
					limit: response.pagination?.limit || 10,
					total: response.pagination?.total || 0,
					totalPages: response.pagination?.totalPages || 0,
				};
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	onFiltersChange(filters: ComplaintFilters): void {
		this.filters = { ...this.filters, ...filters, page: 1 };
		this.loadComplaints();
	}

	onPageChange(event: PageEvent): void {
		this.filters = {
			...this.filters,
			page: event.pageIndex + 1,
			limit: event.pageSize,
		};
		this.loadComplaints();
	}

	viewComplaint(id: string): void {
		this.router.navigate(["/complaints", id]);
	}

	pickUpComplaint(event: Event, complaintId: string): void {
		event.stopPropagation(); // Prevent card click
		const staffId = this.authService.currentUser?.id;
		if (!staffId) return;

		this.isPickingUp = complaintId;

		this.complaintService.assignComplaint(complaintId, staffId).subscribe({
			next: () => {
				// Remove from list or reload
				this.loadComplaints();
				this.isPickingUp = null;
			},
			error: () => {
				this.isPickingUp = null;
			},
		});
	}

	showSla(complaint: Complaint): boolean {
		return complaint.status !== ComplaintStatus.RESOLVED;
	}
}
