import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommentService } from "@core/services/comment.service";
import { AuthService } from "@core/services/auth.service";
import { SnackbarService } from "@core/services/snackbar.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "@shared/components/confirm-dialog/confirm-dialog.component";
import { Comment } from "@core/models";

@Component({
	selector: "app-complaint-comments",
	template: `
		<mat-card class="comments-card">
			<mat-card-header>
				<mat-card-title>
					Comments
					<span class="comment-count" *ngIf="comments.length > 0"
						>({{ comments.length }})</span
					>
				</mat-card-title>
			</mat-card-header>
			<mat-card-content>
				<app-loading-spinner
					*ngIf="isLoading"
					[size]="24"
				></app-loading-spinner>

				<ng-container *ngIf="!isLoading">
					<!-- Add Comment Form -->
					<form
						[formGroup]="commentForm"
						(ngSubmit)="addComment()"
						class="add-comment-form"
						*ngIf="canComment"
					>
						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Add a comment</mat-label>
							<textarea
								matInput
								formControlName="comment"
								placeholder="Write your comment here..."
								rows="3"
								maxlength="1000"
							></textarea>
							<mat-hint align="end"
								>{{
									commentForm.get("comment")?.value?.length || 0
								}}/1000</mat-hint
							>
						</mat-form-field>
						<div class="form-actions">
							<mat-checkbox
								formControlName="is_internal"
								*ngIf="isStaffOrAdmin"
							>
								Internal note (visible only to staff)
							</mat-checkbox>
							<button
								mat-raised-button
								color="primary"
								type="submit"
								[disabled]="commentForm.invalid || isSubmitting"
							>
								<mat-spinner *ngIf="isSubmitting" diameter="18"></mat-spinner>
								<span *ngIf="!isSubmitting">Post Comment</span>
							</button>
						</div>
					</form>

					<!-- Comments List -->
					<div class="comments-list">
						<app-empty-state
							*ngIf="comments.length === 0"
							icon="chat_bubble_outline"
							title="No comments yet"
							message="Be the first to add a comment"
						></app-empty-state>

						<div
							class="comment-item"
							*ngFor="let comment of comments"
							[class.internal]="comment.is_internal"
						>
							<div class="comment-avatar">
								<mat-icon>{{
									comment.is_internal ? "lock" : "person"
								}}</mat-icon>
							</div>
							<div class="comment-content">
								<div class="comment-header">
									<div class="comment-meta">
										<span class="author">{{ comment.user_name }}</span>
										<span
											class="role-badge"
											[class]="'role-' + comment.user_role"
										>
											{{ comment.user_role | titlecase }}
										</span>
										<span class="internal-badge" *ngIf="comment.is_internal">
											Internal
										</span>
									</div>
									<span class="timestamp">{{
										comment.created_at | timeAgo
									}}</span>
								</div>
								<p class="comment-text">
									{{ comment.content || comment.comment }}
								</p>
								<button
									mat-icon-button
									color="warn"
									class="delete-btn"
									*ngIf="canDelete(comment)"
									(click)="deleteComment(comment)"
									matTooltip="Delete comment"
								>
									<mat-icon>delete_outline</mat-icon>
								</button>
							</div>
						</div>
					</div>
				</ng-container>
			</mat-card-content>
		</mat-card>
	`,
	styles: [
		`
			.comments-card mat-card-header {
				padding: 16px 16px 0;
			}

			.comments-card mat-card-content {
				padding: 16px;
			}

			.comment-count {
				font-size: 0.875rem;
				color: var(--text-secondary);
				font-weight: normal;
			}

			.add-comment-form {
				margin-bottom: 24px;
				padding-bottom: 24px;
				border-bottom: 1px solid var(--border-color);
			}

			.full-width {
				width: 100%;
			}

			.form-actions {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 8px;
				flex-wrap: wrap;
				gap: 12px;
			}

			.form-actions button mat-spinner {
				display: inline-block;
				margin-right: 8px;
			}

			.comments-list {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.comment-item {
				display: flex;
				gap: 12px;
				padding: 16px;
				background-color: var(--bg-card);
				border-radius: 8px;
				border: 1px solid var(--border-color);
				position: relative;
			}

			.comment-item.internal {
				background-color: rgba(255, 152, 0, 0.08);
				border-color: rgba(255, 152, 0, 0.3);
			}

			.comment-avatar {
				width: 40px;
				height: 40px;
				border-radius: 50%;
				background-color: var(--primary-color);
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
			}

			.comment-item.internal .comment-avatar {
				background-color: #ff9800;
			}

			.comment-avatar mat-icon {
				color: white;
				font-size: 20px;
				width: 20px;
				height: 20px;
			}

			.comment-content {
				flex: 1;
				min-width: 0;
			}

			.comment-header {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 8px;
				flex-wrap: wrap;
				gap: 8px;
			}

			.comment-meta {
				display: flex;
				align-items: center;
				gap: 8px;
				flex-wrap: wrap;
			}

			.author {
				font-weight: 500;
			}

			.role-badge {
				padding: 2px 6px;
				border-radius: 4px;
				font-size: 0.625rem;
				text-transform: uppercase;
				font-weight: 500;
			}

			.role-user {
				background-color: rgba(33, 150, 243, 0.15);
				color: #2196f3;
			}

			.role-staff {
				background-color: rgba(76, 175, 80, 0.15);
				color: #4caf50;
			}

			.role-admin {
				background-color: rgba(156, 39, 176, 0.15);
				color: #9c27b0;
			}

			.internal-badge {
				padding: 2px 6px;
				border-radius: 4px;
				font-size: 0.625rem;
				text-transform: uppercase;
				font-weight: 500;
				background-color: rgba(255, 152, 0, 0.15);
				color: #ff9800;
			}

			.timestamp {
				font-size: 0.75rem;
				color: var(--text-secondary);
			}

			.comment-text {
				margin: 0;
				line-height: 1.5;
				white-space: pre-wrap;
				word-break: break-word;
			}

			.delete-btn {
				position: absolute;
				top: 8px;
				right: 8px;
				opacity: 0;
				transition: opacity 0.2s ease;
			}

			.comment-item:hover .delete-btn {
				opacity: 1;
			}

			@media (max-width: 600px) {
				.form-actions {
					flex-direction: column;
					align-items: stretch;
				}

				.form-actions button {
					width: 100%;
				}

				.delete-btn {
					opacity: 1;
				}
			}
		`,
	],
})
export class ComplaintCommentsComponent implements OnInit {
	@Input() complaintId!: string;
	@Input() canComment = true;

	comments: Comment[] = [];
	commentForm!: FormGroup;
	isLoading = true;
	isSubmitting = false;

	constructor(
		private fb: FormBuilder,
		private dialog: MatDialog,
		private commentService: CommentService,
		public authService: AuthService,
		private snackbar: SnackbarService
	) {}

	ngOnInit(): void {
		this.initForm();
		this.loadComments();
	}

	get isStaffOrAdmin(): boolean {
		const role = this.authService.currentUser?.role;
		return role === "Staff" || role === "Admin";
	}

	private initForm(): void {
		this.commentForm = this.fb.group({
			comment: [
				"",
				[
					Validators.required,
					Validators.minLength(1),
					Validators.maxLength(1000),
				],
			],
			is_internal: [false],
		});
	}

	private loadComments(): void {
		this.commentService.getCommentsByComplaintId(this.complaintId).subscribe({
			next: (comments) => {
				this.comments = comments.sort(
					(a, b) =>
						new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
				);
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	addComment(): void {
		if (this.commentForm.invalid) return;

		this.isSubmitting = true;
		const data = {
			complaint_id: this.complaintId,
			content: this.commentForm.value.comment, // Map 'comment' to 'content'
			is_internal: this.isStaffOrAdmin ? this.commentForm.value.is_internal : false,
		};

		this.commentService.createComment(data).subscribe({
			next: (comment) => {
				this.comments.push(comment);
				this.commentForm.reset({ comment: "", is_internal: false });
				this.isSubmitting = false;
				this.snackbar.success("Comment added successfully");
			},
			error: () => {
				this.isSubmitting = false;
			},
		});
	}

	canDelete(comment: Comment): boolean {
		const currentUser = this.authService.currentUser;
		if (!currentUser) return false;

		return comment.user_id === currentUser.id || currentUser.role === "Admin";
	}

	deleteComment(comment: Comment): void {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			data: {
				title: "Delete Comment",
				message: "Are you sure you want to delete this comment?",
				confirmText: "Delete",
				confirmColor: "warn",
			},
		});

		dialogRef.afterClosed().subscribe((confirmed) => {
			if (confirmed) {
				this.commentService.deleteComment(comment.id).subscribe({
					next: () => {
						this.comments = this.comments.filter((c) => c.id !== comment.id);
						this.snackbar.success("Comment deleted");
					},
				});
			}
		});
	}
}
