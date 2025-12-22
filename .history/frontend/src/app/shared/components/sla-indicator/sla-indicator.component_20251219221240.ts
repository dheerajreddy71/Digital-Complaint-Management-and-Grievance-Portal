import { Component, Input, OnInit, OnDestroy } from "@angular/core";

@Component({
	selector: "app-sla-indicator",
	template: `
		<div class="sla-indicator" [ngClass]="slaClass">
			<mat-icon class="sla-icon">{{ slaIcon }}</mat-icon>
			<div class="sla-content">
				<span class="sla-text">{{ slaText }}</span>
				<div class="sla-progress" *ngIf="!isOverdue && showProgress">
					<mat-progress-bar
						mode="determinate"
						[value]="progressPercentage"
						[color]="progressColor"
					></mat-progress-bar>
				</div>
			</div>
		</div>
	`,
	styles: [
		`
			.sla-indicator {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				padding: 6px 12px;
				border-radius: 8px;
				font-size: 0.875rem;
				transition: all 0.3s ease;
			}

			.sla-ok {
				background: rgba(139, 195, 74, 0.1);
				color: #689f38;
				border: 1px solid rgba(139, 195, 74, 0.3);
			}

			.sla-warning {
				background: rgba(255, 152, 0, 0.1);
				color: #f57c00;
				border: 1px solid rgba(255, 152, 0, 0.3);
				animation: pulse 2s ease-in-out infinite;
			}

			.sla-overdue {
				background: rgba(244, 67, 54, 0.1);
				color: #d32f2f;
				border: 1px solid rgba(244, 67, 54, 0.3);
				animation: shake 0.5s ease-in-out;
			}

			.sla-resolved {
				background: rgba(33, 150, 243, 0.1);
				color: #1976d2;
				border: 1px solid rgba(33, 150, 243, 0.3);
			}

			.sla-icon {
				font-size: 20px;
				width: 20px;
				height: 20px;
			}

			.sla-content {
				display: flex;
				flex-direction: column;
				gap: 4px;
				min-width: 100px;
			}

			.sla-text {
				font-weight: 500;
				white-space: nowrap;
			}

			.sla-progress {
				width: 100%;
			}

			.sla-progress ::ng-deep mat-progress-bar {
				height: 4px;
				border-radius: 2px;
			}

			@keyframes pulse {
				0%, 100% {
					opacity: 1;
				}
				50% {
					opacity: 0.7;
				}
			}

			@keyframes shake {
				0%, 100% {
					transform: translateX(0);
				}
				25% {
					transform: translateX(-5px);
				}
				75% {
					transform: translateX(5px);
				}
			}

			@media (max-width: 768px) {
				.sla-indicator {
					font-size: 0.75rem;
					padding: 4px 8px;
					gap: 6px;
				}

				.sla-icon {
					font-size: 18px;
					width: 18px;
					height: 18px;
				}

				.sla-content {
					min-width: 80px;
				}
			}
		`,
	],
})
export class SlaIndicatorComponent implements OnInit, OnDestroy {
	@Input() slaDeadline!: string;
	@Input() createdAt?: string;
	@Input() resolvedAt?: string;
	@Input() isOverdue = false;
	@Input() showProgress = true;

	slaClass = "";
	slaIcon = "";
	slaText = "";
	progressPercentage = 0;
	progressColor: "primary" | "accent" | "warn" = "primary";

	private updateInterval: any;

	ngOnInit(): void {
		this.calculateSlaStatus();
		// Update every 30 seconds for real-time countdown
		this.updateInterval = setInterval(() => {
			this.calculateSlaStatus();
		}, 30000);
	}

	ngOnDestroy(): void {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
		}
	}

	private calculateSlaStatus(): void {
		// If resolved, show resolved status
		if (this.resolvedAt) {
			const deadline = new Date(this.slaDeadline);
			const resolved = new Date(this.resolvedAt);
			const wasOverdue = resolved > deadline;
			
			this.slaClass = "sla-resolved";
			this.slaIcon = wasOverdue ? "warning" : "check_circle";
			this.slaText = wasOverdue ? "Resolved (Overdue)" : "Resolved On Time";
			this.progressPercentage = 100;
			return;
		}

		// Calculate remaining time
		const deadline = new Date(this.slaDeadline);
		const now = new Date();
		const msRemaining = deadline.getTime() - now.getTime();

		// Check if overdue
		if (this.isOverdue || msRemaining <= 0) {
			this.slaClass = "sla-overdue";
			this.slaIcon = "error";
			this.slaText = this.formatOverdueTime(deadline);
			this.progressPercentage = 100;
			this.progressColor = "warn";
			return;
		}

		// Calculate progress percentage
		if (this.createdAt) {
			const created = new Date(this.createdAt);
			const totalMs = deadline.getTime() - created.getTime();
			const elapsedMs = now.getTime() - created.getTime();
			this.progressPercentage = Math.min((elapsedMs / totalMs) * 100, 100);
		} else {
			// Fallback: assume 4 hours if no created_at
			const totalMs = 4 * 60 * 60 * 1000;
			const elapsedMs = totalMs - msRemaining;
			this.progressPercentage = Math.min((elapsedMs / totalMs) * 100, 100);
		}

		const hoursRemaining = msRemaining / (1000 * 60 * 60);

		// Check if approaching deadline (> 75%)
		if (this.progressPercentage >= 75 || hoursRemaining <= 4) {
			this.slaClass = "sla-warning";
			this.slaIcon = "warning";
			this.progressColor = "warn";
		} else {
			this.slaClass = "sla-ok";
			this.slaIcon = "schedule";
			this.progressColor = "primary";
		}

		this.slaText = this.formatTimeRemaining(hoursRemaining);
	}

	private formatTimeRemaining(hours: number): string {
		if (hours < 1) {
			const minutes = Math.floor(hours * 60);
			return `${minutes} min remaining`;
		} else if (hours < 24) {
			const h = Math.floor(hours);
			const m = Math.floor((hours - h) * 60);
			return m > 0 ? `${h}h ${m}m remaining` : `${h}h remaining`;
		} else {
			const days = Math.floor(hours / 24);
			const h = Math.floor(hours % 24);
			return h > 0 ? `${days}d ${h}h remaining` : `${days}d remaining`;
		}
	}

	private formatOverdueTime(deadline: Date): string {
		const now = new Date();
		const overdueMs = now.getTime() - deadline.getTime();
		const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
		const overdueDays = Math.floor(overdueHours / 24);

		if (overdueDays > 0) {
			const h = overdueHours % 24;
			return h > 0 ? `Overdue by ${overdueDays}d ${h}h` : `Overdue by ${overdueDays}d`;
		}

		if (overdueHours > 0) {
			return `Overdue by ${overdueHours}h`;
		}

		const overdueMinutes = Math.floor(overdueMs / (1000 * 60));
		return `Overdue by ${overdueMinutes}m`;
	}
}
