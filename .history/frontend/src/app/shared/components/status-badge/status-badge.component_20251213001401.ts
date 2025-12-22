import { Component, Input } from "@angular/core";
import { ComplaintStatus } from "@core/models";

@Component({
	selector: "app-status-badge",
	template: `
		<span class="status-badge" [ngClass]="'status-' + status">
			{{ getStatusLabel() }}
		</span>
	`,
	styles: [
		`
			.status-badge {
				display: inline-flex;
				align-items: center;
				padding: 4px 8px;
				border-radius: 4px;
				font-size: 0.75rem;
				font-weight: 500;
				text-transform: uppercase;
			}

			.status-pending {
				background-color: rgba(255, 152, 0, 0.15);
				color: #ff9800;
			}

			.status-assigned {
				background-color: rgba(33, 150, 243, 0.15);
				color: #2196f3;
			}

			.status-in_progress {
				background-color: rgba(156, 39, 176, 0.15);
				color: #9c27b0;
			}

			.status-resolved {
				background-color: rgba(76, 175, 80, 0.15);
				color: #4caf50;
			}

			.status-rejected {
				background-color: rgba(244, 67, 54, 0.15);
				color: #f44336;
			}

			.status-closed {
				background-color: rgba(96, 125, 139, 0.15);
				color: #607d8b;
			}

			.status-escalated {
				background-color: rgba(233, 30, 99, 0.15);
				color: #e91e63;
			}
		`,
	],
})
export class StatusBadgeComponent {
	@Input() status!: ComplaintStatus;

	getStatusLabel(): string {
		const labels: Record<ComplaintStatus, string> = {
			[ComplaintStatus.OPEN]: "Open",
			[ComplaintStatus.ASSIGNED]: "Assigned",
			[ComplaintStatus.IN_PROGRESS]: "In Progress",
			[ComplaintStatus.RESOLVED]: "Resolved",
		};
		return labels[this.status] || this.status;
	}
}
