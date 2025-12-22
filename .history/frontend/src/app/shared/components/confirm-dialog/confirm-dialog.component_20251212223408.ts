import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface ConfirmDialogData {
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmColor?: "primary" | "accent" | "warn";
}

@Component({
	selector: "app-confirm-dialog",
	template: `
		<h2 mat-dialog-title>{{ data.title }}</h2>
		<mat-dialog-content>
			<p>{{ data.message }}</p>
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-button (click)="onCancel()">
				{{ data.cancelText || "Cancel" }}
			</button>
			<button
				mat-flat-button
				[color]="data.confirmColor || 'primary'"
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
			}
		`,
	],
})
export class ConfirmDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<ConfirmDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
	) {}

	onConfirm(): void {
		this.dialogRef.close(true);
	}

	onCancel(): void {
		this.dialogRef.close(false);
	}
}
