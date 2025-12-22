import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { ComplaintService } from "@core/services/complaint.service";
import { AuthService } from "@core/services/auth.service";
import { UserService } from "@core/services/user.service";
import { SnackbarService } from "@core/services/snackbar.service";
import { ConfirmDialogComponent } from "@shared/components/confirm-dialog/confirm-dialog.component";
import { Complaint, ComplaintStatus, User } from "@core/models";

@Component({
	selector: "app-complaint-detail",
	template: `
		<div class="page-container">
			<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

			<ng-container *ngIf="!isLoading && complaint">
				<div class="complaint-header fade-in">
					<button mat-icon-button (click)="goBack()">
						<mat-icon>arrow_back</mat-icon>
					</button>

					<div class="header-content">
						<div class="header-top">
							<div class="badges">
								<app-status-badge
									[status]="complaint.status"
								></app-status-badge>
								<app-priority-badge
									[priority]="complaint.priority"
								></app-priority-badge>
								<span class="recurring-badge" *ngIf="complaint.is_recurring">
									<mat-icon>repeat</mat-icon>
									Recurring
								</span>
							</div>
							<app-sla-indicator
								*ngIf="showSla"
								[slaDeadline]="complaint.sla_deadline"
								[isOverdue]="complaint.is_overdue"
							></app-sla-indicator>
						</div>
						<h1>{{ complaint.title }}</h1>
						<div class="meta-info">
							<span
								><mat-icon>category</mat-icon>
								{{ complaint.category | categoryLabel }}</span
							>
							<span
								><mat-icon>schedule</mat-icon>
								{{ complaint.created_at | timeAgo }}</span
							>
							<span *ngIf="isStaffOrAdmin"
								><mat-icon>person</mat-icon> {{ complaint.user_name }}</span
							>
						</div>
					</div>

					<div class="header-actions" *ngIf="isStaffOrAdmin || isOwner">
						<button
							mat-stroked-button
							color="primary"
							[matMenuTriggerFor]="statusMenu"
							*ngIf="isStaffOrAdmin && canChangeStatus"
						>
							<mat-icon>edit</mat-icon>
							Update Status
						</button>
						<mat-menu #statusMenu="matMenu">
							<button
								mat-menu-item
								*ngFor="let status of availableStatuses"
								(click)="updateStatus(status.value)"
							>
								{{ status.label }}
							</button>
						</mat-menu>

						<button
							mat-stroked-button
							[matMenuTriggerFor]="assignMenu"
							*ngIf="isAdmin && !complaint.assigned_to"
						>
							<mat-icon>person_add</mat-icon>
							Assign
						</button>
						<mat-menu #assignMenu="matMenu">
							<button mat-menu-item (click)="autoAssign()">
								<mat-icon>auto_fix_high</mat-icon>
								Auto-assign
							</button>
							<mat-divider></mat-divider>
							<button
								mat-menu-item
								*ngFor="let staff of staffList"
								(click)="assignTo(staff.id)"
							>
								<mat-icon>person</mat-icon>
								{{ staff.name }}
							</button>
						</mat-menu>

						<button
							mat-icon-button
							color="warn"
							*ngIf="isOwner && complaint.status === 'Open'"
							(click)="deleteComplaint()"
							matTooltip="Delete complaint"
						>
							<mat-icon>delete</mat-icon>
						</button>
					</div>
				</div>

				<div class="complaint-body">
					<div class="main-content">
						<!-- Description -->
						<mat-card class="detail-card fade-in">
							<mat-card-header>
								<mat-card-title>Description</mat-card-title>
							</mat-card-header>
							<mat-card-content>
								<p class="description">{{ complaint.description }}</p>

								<div class="attachment" *ngIf="complaint.attachment_url">
									<a
										[href]="complaint.attachment_url"
										target="_blank"
										mat-stroked-button
									>
										<mat-icon>attach_file</mat-icon>
										View Attachment
									</a>
								</div>
							</mat-card-content>
						</mat-card>

						<!-- Resolution Notes -->
						<mat-card
							class="detail-card fade-in"
							*ngIf="complaint.resolution_notes"
						>
							<mat-card-header>
								<mat-card-title>Resolution Notes</mat-card-title>
							</mat-card-header>
							<mat-card-content>
								<p>{{ complaint.resolution_notes }}</p>
							</mat-card-content>
						</mat-card>

						<!-- Comments -->
						<app-complaint-comments
							[complaintId]="complaint.id"
							[canComment]="canComment"
						></app-complaint-comments>

						<!-- Feedback -->
						<app-complaint-feedback
							*ngIf="showFeedback"
							[complaint]="complaint"
						></app-complaint-feedback>
					</div>

					<div class="sidebar">
						<!-- Assignment Info -->
						<mat-card class="sidebar-card fade-in">
							<mat-card-header>
								<mat-card-title>Assignment</mat-card-title>
							</mat-card-header>
							<mat-card-content>
								<div class="info-row" *ngIf="complaint.assigned_staff_name">
									<span class="label">Assigned To</span>
									<span class="value">{{ complaint.assigned_staff_name }}</span>
								</div>
								<div class="info-row" *ngIf="!complaint.assigned_staff_name">
									<span class="label">Status</span>
									<span class="value unassigned">Unassigned</span>
								</div>
								<div class="info-row">
									<span class="label">SLA Deadline</span>
									<span class="value">
										{{ complaint.sla_deadline | date : "medium" }}
									</span>
								</div>
								<div class="info-row" *ngIf="complaint.resolved_at">
									<span class="label">Resolved At</span>
									<span class="value">
										{{ complaint.resolved_at | date : "medium" }}
									</span>
								</div>
							</mat-card-content>
						</mat-card>

						<!-- Timeline -->
						<app-complaint-timeline
							[complaintId]="complaint.id"
						></app-complaint-timeline>
					</div>
				</div>
			</ng-container>
		</div>
	`,
	styles: [
		`
			.complaint-header {
				display: flex;
				align-items: flex-start;
				gap: 16px;
				margin-bottom: 24px;
				padding: 24px;
				background: var(--bg-card);
				border-radius: 12px;
				box-shadow: var(--shadow-sm);
			}

			.header-content {
				flex: 1;
			}

			.header-top {
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
				flex-wrap: wrap;
			}

			.recurring-badge {
				display: inline-flex;
				align-items: center;
				gap: 4px;
				padding: 4px 8px;
				border-radius: 4px;
				background-color: rgba(156, 39, 176, 0.15);
				color: #9c27b0;
				font-size: 0.75rem;
				font-weight: 500;
				text-transform: uppercase;
			}

			.recurring-badge mat-icon {
				font-size: 14px;
				width: 14px;
				height: 14px;
			}

			h1 {
				margin: 0 0 8px;
				font-size: 1.5rem;
			}

			.meta-info {
				display: flex;
				gap: 16px;
				flex-wrap: wrap;
				color: var(--text-secondary);
				font-size: 0.875rem;
			}

			.meta-info span {
				display: flex;
				align-items: center;
				gap: 4px;
			}

			.meta-info mat-icon {
				font-size: 16px;
				width: 16px;
				height: 16px;
			}

			.header-actions {
				display: flex;
				gap: 8px;
				flex-wrap: wrap;
			}

			.complaint-body {
				display: grid;
				grid-template-columns: 1fr 350px;
				gap: 24px;
			}

			.main-content {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.detail-card {
				margin-bottom: 0;
			}

			.detail-card mat-card-header {
				padding: 16px 16px 0;
			}

			.description {
				white-space: pre-wrap;
				line-height: 1.6;
			}

			.attachment {
				margin-top: 16px;
				padding-top: 16px;
				border-top: 1px solid var(--border-color);
			}

			.sidebar {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.sidebar-card mat-card-header {
				padding: 16px 16px 0;
			}

			.info-row {
				display: flex;
				justify-content: space-between;
				padding: 8px 0;
				border-bottom: 1px solid var(--border-color);
			}

			.info-row:last-child {
				border-bottom: none;
			}

			.info-row .label {
				color: var(--text-secondary);
				font-size: 0.875rem;
			}

			.info-row .value {
				font-weight: 500;
			}

			.info-row .unassigned {
				color: var(--text-secondary);
				font-style: italic;
			}

			@media (max-width: 1024px) {
				.complaint-body {
					grid-template-columns: 1fr;
				}

				.sidebar {
					order: -1;
				}
			}

			@media (max-width: 600px) {
				.complaint-header {
					flex-direction: column;
				}

				.header-actions {
					width: 100%;
					justify-content: flex-end;
				}
			}
		`,
	],
})
export class ComplaintDetailComponent implements OnInit {
	complaint: Complaint | null = null;
	isLoading = true;
	staffList: User[] = [];

	availableStatuses = [
		{ value: ComplaintStatus.IN_PROGRESS, label: "In Progress" },
		{ value: ComplaintStatus.RESOLVED, label: "Resolved" },
	];

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private complaintService: ComplaintService,
		public authService: AuthService,
		private userService: UserService,
		private snackbar: SnackbarService
	) {}

	ngOnInit(): void {
		const id = this.route.snapshot.paramMap.get("id");
		if (id) {
			this.loadComplaint(id);
			if (this.isAdmin) {
				this.loadStaffList();
			}
		}
	}

	get isOwner(): boolean {
		return this.complaint?.user_id === this.authService.currentUser?.id;
	}

	get isStaffOrAdmin(): boolean {
		const role = this.authService.currentUser?.role;
		return role === "Staff" || role === "Admin";
	}

	get isAdmin(): boolean {
		return this.authService.currentUser?.role === "Admin";
	}

	get canChangeStatus(): boolean {
		return this.complaint?.status !== ComplaintStatus.RESOLVED;
	}

	get canComment(): boolean {
		return this.complaint?.status !== ComplaintStatus.RESOLVED;
	}

	get showSla(): boolean {
		return this.complaint?.status !== ComplaintStatus.RESOLVED;
	}

	get showFeedback(): boolean {
		return this.isOwner && this.complaint?.status === ComplaintStatus.RESOLVED;
	}

	private loadComplaint(id: string): void {
		this.complaintService.getComplaintById(id).subscribe({
			next: (complaint) => {
				this.complaint = complaint;
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
				this.router.navigate(["/complaints"]);
			},
		});
	}

	private loadStaffList(): void {
		this.userService.getStaffList().subscribe({
			next: (staff) => {
				this.staffList = staff;
			},
		});
	}

	goBack(): void {
		this.router.navigate(["/complaints"]);
	}

	updateStatus(status: ComplaintStatus): void {
		if (!this.complaint) return;

		this.complaintService
			.updateComplaint(this.complaint.id, { status })
			.subscribe({
				next: (updated) => {
					this.complaint = updated;
					this.snackbar.success("Status updated successfully");
				},
			});
	}

	assignTo(staffId: string | number): void {
		if (!this.complaint) return;

		this.complaintService
			.assignComplaint(this.complaint.id, String(staffId))
			.subscribe({
				next: (updated) => {
					this.complaint = updated;
					this.snackbar.success("Complaint assigned successfully");
				},
			});
	}

	autoAssign(): void {
		if (!this.complaint) return;

		this.complaintService.autoAssignComplaint(this.complaint.id).subscribe({
			next: (updated) => {
				this.complaint = updated;
				this.snackbar.success(
					`Complaint auto-assigned to ${updated.assigned_staff_name}`
				);
			},
		});
	}

	deleteComplaint(): void {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			data: {
				title: "Delete Complaint",
				message:
					"Are you sure you want to delete this complaint? This action cannot be undone.",
				confirmText: "Delete",
				confirmColor: "warn",
			},
		});

		dialogRef.afterClosed().subscribe((confirmed) => {
			if (confirmed && this.complaint) {
				this.complaintService.deleteComplaint(this.complaint.id).subscribe({
					next: () => {
						this.snackbar.success("Complaint deleted successfully");
						this.router.navigate(["/complaints"]);
					},
				});
			}
		});
	}
}
