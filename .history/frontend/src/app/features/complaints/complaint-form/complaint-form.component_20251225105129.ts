import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { ComplaintService } from "@core/services/complaint.service";
import { SnackbarService } from "@core/services/snackbar.service";
import { ConfirmDialogComponent } from "@shared/components/confirm-dialog/confirm-dialog.component";
import { Complaint, ComplaintCategory, Priority } from "@core/models";

@Component({
	selector: "app-complaint-form",
	template: `
		<div class="page-container">
			<div class="form-header fade-in">
				<button mat-icon-button (click)="goBack()">
					<mat-icon>arrow_back</mat-icon>
				</button>
				<h1>{{ isEditMode ? "Edit Complaint" : "Submit New Complaint" }}</h1>
			</div>

			<form [formGroup]="form" (ngSubmit)="onSubmit()" class="complaint-form">
				<mat-card class="form-card fade-in">
					<mat-card-content>
						<!-- Category -->
						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Category</mat-label>
							<mat-select
								formControlName="category"
								(selectionChange)="onCategoryChange()"
							>
								<mat-option *ngFor="let cat of categories" [value]="cat.value">
									{{ cat.label }}
								</mat-option>
							</mat-select>
							<mat-error *ngIf="form.get('category')?.hasError('required')">
								Category is required
							</mat-error>
						</mat-form-field>

						<!-- Title -->
						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Title</mat-label>
							<input
								matInput
								formControlName="title"
								placeholder="Brief summary of your complaint"
								maxlength="100"
							/>
							<mat-hint align="end"
								>{{ form.get("title")?.value?.length || 0 }}/100</mat-hint
							>
							<mat-error *ngIf="form.get('title')?.hasError('required')">
								Title is required
							</mat-error>
							<mat-error *ngIf="form.get('title')?.hasError('minlength')">
								Title must be at least 10 characters
							</mat-error>
						</mat-form-field>

						<!-- Description -->
						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Description</mat-label>
							<textarea
								matInput
								formControlName="description"
								placeholder="Provide detailed information about your complaint"
								rows="6"
								maxlength="2000"
							></textarea>
							<mat-hint align="end"
								>{{
									form.get("description")?.value?.length || 0
								}}/2000</mat-hint
							>
							<mat-error *ngIf="form.get('description')?.hasError('required')">
								Description is required
							</mat-error>
							<mat-error *ngIf="form.get('description')?.hasError('minlength')">
								Description must be at least 50 characters
							</mat-error>
						</mat-form-field>

						<!-- Priority -->
						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Priority</mat-label>
							<mat-select formControlName="priority">
								<mat-option *ngFor="let pri of priorities" [value]="pri.value">
									<span class="priority-option">
										<span
											class="priority-dot"
											[class]="'priority-' + pri.value"
										></span>
										{{ pri.label }}
									</span>
								</mat-option>
							</mat-select>
							<mat-hint>Select based on urgency and impact</mat-hint>
						</mat-form-field>

						<!-- Location -->
						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Location</mat-label>
							<input
								matInput
								formControlName="location"
								placeholder="Room/Building/Area where the issue is located"
								maxlength="200"
							/>
							<mat-error *ngIf="form.get('location')?.hasError('required')">
								Location is required
							</mat-error>
						</mat-form-field>

						<!-- AI Suggestions -->
						<div class="ai-suggestions" *ngIf="suggestions">
							<mat-icon>auto_fix_high</mat-icon>
							<div class="suggestion-content">
								<span class="suggestion-label">AI Suggestions:</span>
								<div class="suggestion-chips">
									<mat-chip
										*ngIf="
											suggestions.suggestedCategory &&
											suggestions.suggestedCategory !==
												form.get('category')?.value
										"
										(click)="applySuggestedCategory()"
									>
										Category:
										{{ suggestions.suggestedCategory | categoryLabel }}
									</mat-chip>
									<mat-chip
										*ngIf="
											suggestions.suggestedPriority &&
											suggestions.suggestedPriority !==
												form.get('priority')?.value
										"
										(click)="applySuggestedPriority()"
									>
										Priority: {{ suggestions.suggestedPriority | titlecase }}
									</mat-chip>
								</div>
							</div>
						</div>

						<!-- Duplicate Warning -->
						<div class="duplicate-warning" *ngIf="duplicates.length > 0">
							<mat-icon color="warn">warning</mat-icon>
							<div class="warning-content">
								<span>Similar complaints found:</span>
								<ul>
									<li *ngFor="let dup of duplicates.slice(0, 3)">
										<a [routerLink]="['/complaints', dup.id]">{{
											dup.title
										}}</a>
										<span class="dup-status">- {{ dup.status }}</span>
									</li>
								</ul>
							</div>
						</div>

						<!-- File Upload -->
						<div class="file-upload-section">
							<label class="section-label">Attachment (Optional)</label>
							<app-file-upload
								(fileSelected)="onFileSelected($event)"
								[acceptedTypes]="'.pdf,.jpg,.jpeg,.png,.doc,.docx'"
								[maxSizeMb]="5"
							></app-file-upload>
							<div class="selected-file" *ngIf="selectedFile">
								<mat-icon>attach_file</mat-icon>
								<span>{{ selectedFile.name }}</span>
								<button mat-icon-button (click)="removeFile()" type="button">
									<mat-icon>close</mat-icon>
								</button>
							</div>
						</div>
					</mat-card-content>

					<mat-card-actions align="end">
						<button mat-button type="button" (click)="goBack()">Cancel</button>
						<button
							mat-raised-button
							color="primary"
							type="submit"
							[disabled]="form.invalid || isSubmitting"
						>
							<mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
							<span *ngIf="!isSubmitting">
								{{ isEditMode ? "Update" : "Submit" }} Complaint
							</span>
						</button>
					</mat-card-actions>
				</mat-card>
			</form>
		</div>
	`,
	styles: [
		`
			.form-header {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 24px;
			}

			.form-header h1 {
				margin: 0;
				font-size: 1.5rem;
			}

			.complaint-form {
				max-width: 800px;
			}

			.form-card {
				margin-bottom: 24px;
			}

			.form-card mat-card-content {
				display: flex;
				flex-direction: column;
				gap: 16px;
				padding: 24px;
			}

			.form-card mat-card-actions {
				padding: 16px 24px;
				margin: 0;
			}

			.full-width {
				width: 100%;
			}

			.priority-option {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.priority-dot {
				width: 10px;
				height: 10px;
				border-radius: 50%;
			}

			.priority-low {
				background-color: #4caf50;
			}

			.priority-medium {
				background-color: #ff9800;
			}

			.priority-high {
				background-color: #f44336;
			}

			.priority-critical {
				background-color: #9c27b0;
			}

			.ai-suggestions {
				display: flex;
				align-items: flex-start;
				gap: 12px;
				padding: 16px;
				background-color: rgba(33, 150, 243, 0.1);
				border-radius: 8px;
				border-left: 4px solid #2196f3;
			}

			.ai-suggestions mat-icon {
				color: #2196f3;
			}

			.suggestion-content {
				flex: 1;
			}

			.suggestion-label {
				font-weight: 500;
				display: block;
				margin-bottom: 8px;
			}

			.suggestion-chips {
				display: flex;
				gap: 8px;
				flex-wrap: wrap;
			}

			.suggestion-chips mat-chip {
				cursor: pointer;
			}

			.duplicate-warning {
				display: flex;
				align-items: flex-start;
				gap: 12px;
				padding: 16px;
				background-color: rgba(244, 67, 54, 0.1);
				border-radius: 8px;
				border-left: 4px solid #f44336;
			}

			.warning-content {
				flex: 1;
			}

			.warning-content ul {
				margin: 8px 0 0;
				padding-left: 20px;
			}

			.warning-content li {
				margin-bottom: 4px;
			}

			.warning-content a {
				color: var(--primary-color);
				text-decoration: none;
			}

			.warning-content a:hover {
				text-decoration: underline;
			}

			.dup-status {
				color: var(--text-secondary);
				font-size: 0.875rem;
			}

			.file-upload-section {
				margin-top: 8px;
			}

			.section-label {
				display: block;
				margin-bottom: 8px;
				color: var(--text-secondary);
				font-size: 0.875rem;
			}

			.selected-file {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-top: 12px;
				padding: 8px 12px;
				background-color: var(--bg-card);
				border-radius: 4px;
				border: 1px solid var(--border-color);
			}

			.selected-file mat-icon {
				color: var(--text-secondary);
			}

			.selected-file span {
				flex: 1;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			mat-card-actions button mat-spinner {
				display: inline-block;
				margin-right: 8px;
			}

			@media (max-width: 600px) {
				.form-card mat-card-content {
					padding: 16px;
				}

				.form-card mat-card-actions {
					flex-direction: column;
					gap: 8px;
				}

				.form-card mat-card-actions button {
					width: 100%;
				}
			}
		`,
	],
})
export class ComplaintFormComponent implements OnInit {
	form!: FormGroup;
	isEditMode = false;
	isSubmitting = false;
	selectedFile: File | null = null;
	suggestions: {
		suggestedCategory?: ComplaintCategory;
		suggestedPriority?: Priority;
	} | null = null;
	duplicates: Complaint[] = [];
	private complaintId: string | null = null;

	categories = [
		{ value: ComplaintCategory.PLUMBING, label: "Plumbing" },
		{ value: ComplaintCategory.ELECTRICAL, label: "Electrical" },
		{ value: ComplaintCategory.FACILITY, label: "Facility" },
		{ value: ComplaintCategory.IT, label: "IT" },
		{ value: ComplaintCategory.OTHER, label: "Other" },
	];

	priorities = [
		{ value: Priority.LOW, label: "Low" },
		{ value: Priority.MEDIUM, label: "Medium" },
		{ value: Priority.HIGH, label: "High" },
		{ value: Priority.CRITICAL, label: "Critical" },
	];

	constructor(
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private complaintService: ComplaintService,
		private snackbar: SnackbarService
	) {}

	ngOnInit(): void {
		this.initForm();

		this.complaintId = this.route.snapshot.paramMap.get("id");
		if (this.complaintId) {
			this.isEditMode = true;
			this.loadComplaint();
		}
	}

	private initForm(): void {
		this.form = this.fb.group({
			category: ["", Validators.required],
			title: [
				"",
				[
					Validators.required,
					Validators.minLength(10),
					Validators.maxLength(100),
				],
			],
			description: [
				"",
				[
					Validators.required,
					Validators.minLength(50),
					Validators.maxLength(2000),
				],
			],
			priority: [Priority.MEDIUM],
			location: ["", Validators.required],
		});
	}

	private loadComplaint(): void {
		if (!this.complaintId) return;

		this.complaintService.getComplaintById(this.complaintId).subscribe({
			next: (complaint) => {
				this.form.patchValue({
					category: complaint.category,
					title: complaint.title,
					description: complaint.description,
					priority: complaint.priority,
					location: complaint.location || "",
				});
			},
			error: () => {
				this.router.navigate(["/complaints"]);
			},
		});
	}

	onCategoryChange(): void {
		this.checkForDuplicates();
		this.getSuggestions();
	}

	private checkForDuplicates(): void {
		const title = this.form.get("title")?.value;
		const description = this.form.get("description")?.value;

		if (title?.length >= 10 || description?.length >= 50) {
			this.complaintService.checkDuplicates({ title, description }).subscribe({
				next: (result) => {
					this.duplicates = result.possibleDuplicates || [];
				},
			});
		}
	}

	private getSuggestions(): void {
		const title = this.form.get("title")?.value;
		const description = this.form.get("description")?.value;

		if (description?.length >= 50) {
			this.complaintService.getSuggestions({ title, description }).subscribe({
				next: (result) => {
					this.suggestions = result;
				},
			});
		}
	}

	applySuggestedCategory(): void {
		if (this.suggestions?.suggestedCategory) {
			this.form.patchValue({ category: this.suggestions.suggestedCategory });
		}
	}

	applySuggestedPriority(): void {
		if (this.suggestions?.suggestedPriority) {
			this.form.patchValue({ priority: this.suggestions.suggestedPriority });
		}
	}

	onFileSelected(file: File | null): void {
		if (!file) return;
		this.selectedFile = file;
	}

	removeFile(): void {
		this.selectedFile = null;
	}

	onSubmit(): void {
		if (this.form.invalid) return;

		if (this.duplicates.length > 0 && !this.isEditMode) {
			const dialogRef = this.dialog.open(ConfirmDialogComponent, {
				data: {
					title: "Possible Duplicate",
					message:
						"Similar complaints have been found. Are you sure you want to submit this as a new complaint?",
					confirmText: "Submit Anyway",
				},
			});

			dialogRef.afterClosed().subscribe((confirmed) => {
				if (confirmed) {
					this.submitForm();
				}
			});
		} else {
			this.submitForm();
		}
	}

	private submitForm(): void {
		this.isSubmitting = true;

		const formData = new FormData();

		// Append only the form fields (not nested objects)
		formData.append("title", this.form.value.title || "");
		formData.append("description", this.form.value.description || "");
		formData.append("category", this.form.value.category || "");
		formData.append("priority", this.form.value.priority || "");
		formData.append("location", this.form.value.location || "");

		// Append file if selected
		if (this.selectedFile) {
			formData.append("attachments", this.selectedFile);
		}

		const request$ = this.isEditMode
			? this.complaintService.updateComplaint(
					this.complaintId!,
					this.form.value
			  )
			: this.complaintService.createComplaint(formData as any);

		request$.subscribe({
			next: (complaint) => {
				this.isSubmitting = false;
				this.snackbar.success(
					this.isEditMode
						? "Complaint updated successfully"
						: "Complaint submitted successfully"
				);
				this.router.navigate(["/complaints", complaint.id]);
			},
			error: () => {
				this.isSubmitting = false;
			},
		});
	}

	goBack(): void {
		this.router.navigate(["/complaints"]);
	}
}
