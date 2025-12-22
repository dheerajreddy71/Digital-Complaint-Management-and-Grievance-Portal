import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface ConfirmDialogData {
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmColor?: "primary" | "accent" | "warn";
	requireInput?: boolean;
	inputLabel?: string;
	inputPlaceholder?: string;
}

@Component({
	selector: "app-confirm-dialog",
	template: `
		<h2 mat-dialog-title>{{ data.title }}</h2>
		<mat-dialog-content>
			<p>{{ data.message }}</p>
			<mat-form-field *ngIf="data.requireInput" appearance="outline" class="full-width">
				<mat-label>{{ data.inputLabel || "Input" }}</mat-label>
				<textarea
					matInput
					[(ngModel)]="inputValue"
					[placeholder]="data.inputPlaceholder || ''"
					rows="3"
					cdkFocusInitial
				></textarea>
			</mat-form-field>
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-button (click)="onCancel()">
				{{ data.cancelText || "Cancel" }}
			</button>
			<button
				mat-flat-button
				[color]="data.confirmColor || 'primary'"
				[disabled]="data.requireInput && !inputValue"
				(click)="onConfirm()"
			>
				{{ data.confirmText || "Confirm" }}
			</button>
		</mat-dialog-actions>
	`,
	styles: [
		`
			mat-dialog-content {
				min-width: 300px;
			}

			p {
				color: var(--text-secondary);
				line-height: 1.5;
				margin-bottom: 16px;
			}

			.full-width {
				width: 100%;
			}
		`,
	],
})
export class ConfirmDialogComponent {
	inputValue = "";

	constructor(
		public dialogRef: MatDialogRef<ConfirmDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
	) {}

	onConfirm(): void {
		if (this.data.requireInput) {
			this.dialogRef.close({ confirmed: true, input: this.inputValue });
		} else {
			this.dialogRef.close(true);
		}
	}

	onCancel(): void {
		this.dialogRef.close(false);
	}
}
