import { Component, Input } from "@angular/core";

@Component({
	selector: "app-workload-indicator",
	template: `
		<div class="workload-container" [ngClass]="workloadClass">
			<div class="workload-header">
				<mat-icon>work</mat-icon>
				<span class="workload-label">Workload</span>
			</div>

			<div class="workload-bar">
				<mat-progress-bar
					mode="determinate"
					[value]="workloadPercentage"
					[color]="progressColor"
				></mat-progress-bar>
			</div>

			<div class="workload-info">
				<span class="count">{{ activeComplaints }} / {{ maxCapacity }}</span>
				<span class="percentage">{{ workloadPercentage }}%</span>
			</div>

			<div class="status-badge" [ngClass]="statusClass">
				<mat-icon>{{ statusIcon }}</mat-icon>
				<span>{{ statusText }}</span>
			</div>
		</div>
	`,
	styles: [
		`
			.workload-container {
				padding: 16px;
				border-radius: 8px;
				border: 1px solid #e0e0e0;
				transition: all 0.3s ease;
			}

			.workload-container.low {
				background: rgba(76, 175, 80, 0.05);
				border-color: rgba(76, 175, 80, 0.3);
			}

			.workload-container.medium {
				background: rgba(255, 152, 0, 0.05);
				border-color: rgba(255, 152, 0, 0.3);
			}

			.workload-container.high {
				background: rgba(244, 67, 54, 0.05);
				border-color: rgba(244, 67, 54, 0.3);
			}

			.workload-header {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 12px;
			}

			.workload-header mat-icon {
				font-size: 20px;
				width: 20px;
				height: 20px;
				color: #666;
			}

			.workload-label {
				font-size: 0.875rem;
				font-weight: 600;
				color: #333;
			}

			.workload-bar {
				margin-bottom: 8px;
			}

			.workload-bar ::ng-deep mat-progress-bar {
				height: 8px;
				border-radius: 4px;
			}

			.workload-info {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 12px;
			}

			.count {
				font-size: 1.125rem;
				font-weight: 700;
				color: #333;
			}

			.percentage {
				font-size: 0.875rem;
				font-weight: 600;
				color: #666;
			}

			.status-badge {
				display: inline-flex;
				align-items: center;
				gap: 6px;
				padding: 6px 12px;
				border-radius: 16px;
				font-size: 0.8125rem;
				font-weight: 600;
			}

			.status-badge.available {
				background: rgba(76, 175, 80, 0.1);
				color: #388e3c;
			}

			.status-badge.busy {
				background: rgba(255, 152, 0, 0.1);
				color: #f57c00;
			}

			.status-badge.overloaded {
				background: rgba(244, 67, 54, 0.1);
				color: #d32f2f;
			}

			.status-badge mat-icon {
				font-size: 16px;
				width: 16px;
				height: 16px;
			}

			@media (max-width: 768px) {
				.workload-container {
					padding: 12px;
				}

				.workload-info {
					font-size: 0.875rem;
				}

				.status-badge {
					font-size: 0.75rem;
					padding: 4px 10px;
				}
			}
		`,
	],
})
export class WorkloadIndicatorComponent {
	@Input() activeComplaints: number = 0;
	@Input() maxCapacity: number = 10; // Default max capacity per staff

	get workloadPercentage(): number {
		return Math.min((this.activeComplaints / this.maxCapacity) * 100, 100);
	}

	get workloadClass(): string {
		if (this.workloadPercentage < 50) return "low";
		if (this.workloadPercentage < 80) return "medium";
		return "high";
	}

	get progressColor(): "primary" | "accent" | "warn" {
		if (this.workloadPercentage < 50) return "primary";
		if (this.workloadPercentage < 80) return "accent";
		return "warn";
	}

	get statusClass(): string {
		if (this.workloadPercentage < 50) return "available";
		if (this.workloadPercentage < 90) return "busy";
		return "overloaded";
	}

	get statusIcon(): string {
		if (this.workloadPercentage < 50) return "check_circle";
		if (this.workloadPercentage < 90) return "schedule";
		return "warning";
	}

	get statusText(): string {
		if (this.workloadPercentage < 50) return "Available";
		if (this.workloadPercentage < 90) return "Busy";
		return "Overloaded";
	}
}
