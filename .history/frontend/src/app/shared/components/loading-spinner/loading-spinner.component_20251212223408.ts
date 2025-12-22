import { Component, Input } from "@angular/core";

@Component({
	selector: "app-loading-spinner",
	template: `
		<div class="loading-container" [style.minHeight.px]="minHeight">
			<mat-spinner [diameter]="diameter"></mat-spinner>
			<p *ngIf="message" class="loading-message">{{ message }}</p>
		</div>
	`,
	styles: [
		`
			.loading-container {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				gap: 16px;
			}

			.loading-message {
				color: var(--text-secondary);
				font-size: 0.875rem;
				margin: 0;
			}
		`,
	],
})
export class LoadingSpinnerComponent {
	@Input() diameter = 40;
	@Input() message = "";
	@Input() minHeight = 200;
}
