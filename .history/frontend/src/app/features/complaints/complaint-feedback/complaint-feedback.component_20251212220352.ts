import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackService } from '@core/services/feedback.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { Complaint, Feedback } from '@core/models';

@Component({
  selector: 'app-complaint-feedback',
  template: `
    <mat-card class="feedback-card">
      <mat-card-header>
        <mat-card-title>Your Feedback</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <app-loading-spinner *ngIf="isLoading" [size]="24"></app-loading-spinner>

        <ng-container *ngIf="!isLoading">
          <!-- Show existing feedback -->
          <div class="existing-feedback" *ngIf="feedback">
            <div class="feedback-rating">
              <app-star-rating
                [rating]="feedback.rating"
                [readonly]="true"
              ></app-star-rating>
              <span class="rating-text">{{ getRatingText(feedback.rating) }}</span>
            </div>
            <p class="feedback-comments" *ngIf="feedback.comments">
              "{{ feedback.comments }}"
            </p>
            <p class="feedback-date">
              Submitted {{ feedback.created_at | timeAgo }}
            </p>
          </div>

          <!-- Feedback form -->
          <form
            [formGroup]="feedbackForm"
            (ngSubmit)="submitFeedback()"
            class="feedback-form"
            *ngIf="!feedback"
          >
            <p class="form-intro">
              Your complaint has been resolved. Please take a moment to rate your experience.
            </p>

            <div class="rating-section">
              <label class="section-label">How would you rate our service?</label>
              <app-star-rating
                [rating]="feedbackForm.get('rating')?.value || 0"
                (ratingChange)="onRatingChange($event)"
              ></app-star-rating>
              <span class="rating-text" *ngIf="feedbackForm.get('rating')?.value">
                {{ getRatingText(feedbackForm.get('rating')?.value) }}
              </span>
              <mat-error *ngIf="feedbackForm.get('rating')?.touched && feedbackForm.get('rating')?.hasError('required')">
                Please select a rating
              </mat-error>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Additional comments (optional)</mat-label>
              <textarea
                matInput
                formControlName="comments"
                placeholder="Share your thoughts about the resolution..."
                rows="4"
                maxlength="500"
              ></textarea>
              <mat-hint align="end">{{ feedbackForm.get('comments')?.value?.length || 0 }}/500</mat-hint>
            </mat-form-field>

            <div class="form-actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="feedbackForm.invalid || isSubmitting"
              >
                <mat-spinner *ngIf="isSubmitting" diameter="18"></mat-spinner>
                <span *ngIf="!isSubmitting">Submit Feedback</span>
              </button>
            </div>
          </form>
        </ng-container>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .feedback-card mat-card-header {
        padding: 16px 16px 0;
      }

      .feedback-card mat-card-content {
        padding: 16px;
      }

      .existing-feedback {
        text-align: center;
        padding: 24px;
      }

      .feedback-rating {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }

      .rating-text {
        font-size: 1.125rem;
        font-weight: 500;
        color: var(--primary-color);
      }

      .feedback-comments {
        font-style: italic;
        color: var(--text-secondary);
        margin: 16px 0;
        padding: 16px;
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 8px;
      }

      :host-context(.dark-theme) .feedback-comments {
        background-color: rgba(255, 255, 255, 0.05);
      }

      .feedback-date {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0;
      }

      .feedback-form {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .form-intro {
        margin: 0;
        color: var(--text-secondary);
        text-align: center;
      }

      .rating-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .section-label {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .full-width {
        width: 100%;
      }

      .form-actions {
        display: flex;
        justify-content: center;
      }

      .form-actions button {
        min-width: 150px;
      }

      .form-actions button mat-spinner {
        display: inline-block;
        margin-right: 8px;
      }

      mat-error {
        text-align: center;
        font-size: 0.75rem;
      }
    `,
  ],
})
export class ComplaintFeedbackComponent implements OnInit {
  @Input() complaint!: Complaint;

  feedback: Feedback | null = null;
  feedbackForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;

  private ratingTexts: Record<number, string> = {
    1: 'Very Poor',
    2: 'Poor',
    3: 'Average',
    4: 'Good',
    5: 'Excellent',
  };

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadExistingFeedback();
  }

  private initForm(): void {
    this.feedbackForm = this.fb.group({
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comments: ['', [Validators.maxLength(500)]],
    });
  }

  private loadExistingFeedback(): void {
    this.feedbackService.getFeedbackByComplaintId(this.complaint.id).subscribe({
      next: (feedback) => {
        this.feedback = feedback;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  getRatingText(rating: number): string {
    return this.ratingTexts[rating] || '';
  }

  onRatingChange(rating: number): void {
    this.feedbackForm.patchValue({ rating });
    this.feedbackForm.get('rating')?.markAsTouched();
  }

  submitFeedback(): void {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const data = {
      complaint_id: this.complaint.id,
      ...this.feedbackForm.value,
    };

    this.feedbackService.createFeedback(data).subscribe({
      next: (feedback) => {
        this.feedback = feedback;
        this.isSubmitting = false;
        this.snackbar.success('Thank you for your feedback!');
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
