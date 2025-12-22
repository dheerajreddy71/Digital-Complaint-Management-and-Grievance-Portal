import { Component, Input } from "@angular/core";
import { Priority } from "@core/models";

@Component({
	selector: "app-priority-badge",
	template: `
		<span class="priority-badge" [ngClass]="'priority-' + priority">
			{{ getPriorityLabel() }}
		</span>
	`,
	styles: [
		`
			.priority-badge {
				display: inline-flex;
				align-items: center;
				padding: 4px 8px;
				border-radius: 4px;
				font-size: 0.75rem;
				font-weight: 500;
				text-transform: uppercase;
			}

			.priority-low {
				background-color: rgba(139, 195, 74, 0.15);
				color: #8bc34a;
			}

			.priority-medium {
				background-color: rgba(255, 152, 0, 0.15);
				color: #ff9800;
			}

			.priority-high {
				background-color: rgba(244, 67, 54, 0.15);
				color: #f44336;
			}

			.priority-critical {
				background-color: rgba(156, 39, 176, 0.15);
				color: #9c27b0;
			}
		`,
	],
})
export class PriorityBadgeComponent {
	@Input() priority!: Priority;

	getPriorityLabel(): string {
		const labels: Record<Priority, string> = {
			[Priority.LOW]: "Low",
			[Priority.MEDIUM]: "Medium",
			[Priority.HIGH]: "High",
			[Priority.CRITICAL]: "Critical",
		};
		return labels[this.priority] || this.priority;
	}
}
