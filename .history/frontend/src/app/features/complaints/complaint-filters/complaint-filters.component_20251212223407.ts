import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
	ComplaintFilters,
	ComplaintStatus,
	Priority,
	ComplaintCategory,
} from "@core/models";

@Component({
	selector: "app-complaint-filters",
	template: `
		<mat-expansion-panel class="filters-panel" [expanded]="isExpanded">
			<mat-expansion-panel-header>
				<mat-panel-title>
					<mat-icon>filter_list</mat-icon>
					Filters
				</mat-panel-title>
				<mat-panel-description *ngIf="activeFiltersCount > 0">
					{{ activeFiltersCount }} active filter{{
						activeFiltersCount > 1 ? "s" : ""
					}}
				</mat-panel-description>
			</mat-expansion-panel-header>

			<form [formGroup]="filterForm" class="filters-form">
				<div class="filters-row">
					<mat-form-field appearance="outline">
						<mat-label>Search</mat-label>
						<input
							matInput
							formControlName="search"
							placeholder="Search by title or description"
						/>
						<mat-icon matPrefix>search</mat-icon>
					</mat-form-field>

					<mat-form-field appearance="outline">
						<mat-label>Status</mat-label>
						<mat-select formControlName="status">
							<mat-option value="">All</mat-option>
							<mat-option
								*ngFor="let status of statuses"
								[value]="status.value"
							>
								{{ status.label }}
							</mat-option>
						</mat-select>
					</mat-form-field>

					<mat-form-field appearance="outline">
						<mat-label>Priority</mat-label>
						<mat-select formControlName="priority">
							<mat-option value="">All</mat-option>
							<mat-option
								*ngFor="let priority of priorities"
								[value]="priority.value"
							>
								{{ priority.label }}
							</mat-option>
						</mat-select>
					</mat-form-field>

					<mat-form-field appearance="outline">
						<mat-label>Category</mat-label>
						<mat-select formControlName="category">
							<mat-option value="">All</mat-option>
							<mat-option
								*ngFor="let category of categories"
								[value]="category.value"
							>
								{{ category.label }}
							</mat-option>
						</mat-select>
					</mat-form-field>
				</div>

				<div class="filters-row">
					<mat-checkbox formControlName="is_overdue" color="warn">
						Show only overdue
					</mat-checkbox>

					<mat-form-field appearance="outline">
						<mat-label>Sort By</mat-label>
						<mat-select formControlName="sort_by">
							<mat-option value="created_at">Created Date</mat-option>
							<mat-option value="updated_at">Last Updated</mat-option>
							<mat-option value="sla_deadline">SLA Deadline</mat-option>
							<mat-option value="priority">Priority</mat-option>
						</mat-select>
					</mat-form-field>

					<mat-form-field appearance="outline">
						<mat-label>Order</mat-label>
						<mat-select formControlName="sort_order">
							<mat-option value="desc">Newest First</mat-option>
							<mat-option value="asc">Oldest First</mat-option>
						</mat-select>
					</mat-form-field>

					<div class="filter-actions">
						<button mat-button type="button" (click)="resetFilters()">
							<mat-icon>clear</mat-icon>
							Clear
						</button>
						<button
							mat-flat-button
							color="primary"
							type="button"
							(click)="applyFilters()"
						>
							<mat-icon>check</mat-icon>
							Apply
						</button>
					</div>
				</div>
			</form>
		</mat-expansion-panel>
	`,
	styles: [
		`
			.filters-panel {
				margin-bottom: 24px;
			}

			.filters-panel mat-panel-title {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.filters-form {
				padding-top: 16px;
			}

			.filters-row {
				display: flex;
				flex-wrap: wrap;
				gap: 16px;
				align-items: center;
				margin-bottom: 16px;
			}

			.filters-row:last-child {
				margin-bottom: 0;
			}

			.filters-row mat-form-field {
				flex: 1;
				min-width: 180px;
			}

			.filter-actions {
				display: flex;
				gap: 8px;
				margin-left: auto;
			}

			@media (max-width: 768px) {
				.filters-row mat-form-field {
					min-width: 100%;
				}

				.filter-actions {
					width: 100%;
					justify-content: flex-end;
				}
			}
		`,
	],
})
export class ComplaintFiltersComponent implements OnInit {
	@Input() filters: ComplaintFilters = {};
	@Input() showUserFilter = false;
	@Output() filtersChange = new EventEmitter<ComplaintFilters>();

	filterForm!: FormGroup;
	isExpanded = false;
	activeFiltersCount = 0;

	statuses = [
		{ value: ComplaintStatus.PENDING, label: "Pending" },
		{ value: ComplaintStatus.ASSIGNED, label: "Assigned" },
		{ value: ComplaintStatus.IN_PROGRESS, label: "In Progress" },
		{ value: ComplaintStatus.RESOLVED, label: "Resolved" },
		{ value: ComplaintStatus.REJECTED, label: "Rejected" },
		{ value: ComplaintStatus.CLOSED, label: "Closed" },
		{ value: ComplaintStatus.ESCALATED, label: "Escalated" },
	];

	priorities = [
		{ value: Priority.LOW, label: "Low" },
		{ value: Priority.MEDIUM, label: "Medium" },
		{ value: Priority.HIGH, label: "High" },
		{ value: Priority.CRITICAL, label: "Critical" },
	];

	categories = [
		{ value: ComplaintCategory.BILLING, label: "Billing" },
		{ value: ComplaintCategory.TECHNICAL, label: "Technical" },
		{ value: ComplaintCategory.SERVICE, label: "Service" },
		{ value: ComplaintCategory.GENERAL, label: "General" },
	];

	constructor(private fb: FormBuilder) {}

	ngOnInit(): void {
		this.filterForm = this.fb.group({
			search: [this.filters.search || ""],
			status: [this.filters.status || ""],
			priority: [this.filters.priority || ""],
			category: [this.filters.category || ""],
			is_overdue: [this.filters.is_overdue || false],
			sort_by: [this.filters.sort_by || "created_at"],
			sort_order: [this.filters.sort_order || "desc"],
		});

		this.updateActiveFiltersCount();
	}

	applyFilters(): void {
		const formValue = this.filterForm.value;
		const filters: ComplaintFilters = {
			search: formValue.search || undefined,
			status: formValue.status || undefined,
			priority: formValue.priority || undefined,
			category: formValue.category || undefined,
			is_overdue: formValue.is_overdue || undefined,
			sort_by: formValue.sort_by,
			sort_order: formValue.sort_order,
		};

		this.updateActiveFiltersCount();
		this.filtersChange.emit(filters);
	}

	resetFilters(): void {
		this.filterForm.reset({
			search: "",
			status: "",
			priority: "",
			category: "",
			is_overdue: false,
			sort_by: "created_at",
			sort_order: "desc",
		});
		this.applyFilters();
	}

	private updateActiveFiltersCount(): void {
		const values = this.filterForm.value;
		this.activeFiltersCount = [
			values.search,
			values.status,
			values.priority,
			values.category,
			values.is_overdue,
		].filter(Boolean).length;
	}
}
