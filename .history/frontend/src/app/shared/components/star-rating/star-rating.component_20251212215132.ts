import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  template: `
    <div class="star-rating" [class.readonly]="readonly">
      <button
        *ngFor="let star of stars; let i = index"
        type="button"
        class="star-button"
        [class.filled]="i < rating"
        [class.hovered]="!readonly && i < hoverRating"
        [disabled]="readonly"
        (click)="onStarClick(i + 1)"
        (mouseenter)="onStarHover(i + 1)"
        (mouseleave)="onStarLeave()"
        [attr.aria-label]="'Rate ' + (i + 1) + ' out of ' + maxRating"
      >
        <mat-icon>{{ i < (hoverRating || rating) ? 'star' : 'star_border' }}</mat-icon>
      </button>
      <span *ngIf="showLabel" class="rating-label">{{ rating }}/{{ maxRating }}</span>
    </div>
  `,
  styles: [
    `
      .star-rating {
        display: inline-flex;
        align-items: center;
        gap: 2px;
      }

      .star-button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        color: #ffc107;
        transition: transform 0.1s ease;
      }

      .star-button:disabled {
        cursor: default;
      }

      .star-button:not(:disabled):hover {
        transform: scale(1.1);
      }

      .star-button mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .readonly .star-button {
        pointer-events: none;
      }

      .rating-label {
        margin-left: 8px;
        color: var(--text-secondary);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() maxRating = 5;
  @Input() readonly = false;
  @Input() showLabel = false;
  @Output() ratingChange = new EventEmitter<number>();

  hoverRating = 0;
  stars: number[] = [];

  ngOnInit(): void {
    this.stars = Array(this.maxRating).fill(0);
  }

  onStarClick(rating: number): void {
    if (!this.readonly) {
      this.rating = rating;
      this.ratingChange.emit(rating);
    }
  }

  onStarHover(rating: number): void {
    if (!this.readonly) {
      this.hoverRating = rating;
    }
  }

  onStarLeave(): void {
    this.hoverRating = 0;
  }
}
