import { Component, EventEmitter, Input, Output } from "@angular/core";
import { environment } from "@environments/environment";

@Component({
	selector: "app-file-upload",
	template: `
		<div
			class="file-upload"
			[class.has-file]="selectedFile"
			[class.error]="errorMessage"
			(dragover)="onDragOver($event)"
			(dragleave)="onDragLeave($event)"
			(drop)="onDrop($event)"
		>
			<input
				type="file"
				#fileInput
				[accept]="acceptedTypes"
				(change)="onFileSelected($event)"
				hidden
			/>

			<div
				*ngIf="!selectedFile"
				class="upload-area"
				(click)="fileInput.click()"
			>
				<mat-icon>cloud_upload</mat-icon>
				<p class="upload-text">
					Drag and drop a file here or <span class="link">browse</span>
				</p>
				<p class="upload-hint">
					Accepted: JPG, PNG, PDF (max {{ maxSizeMB }}MB)
				</p>
			</div>

			<div *ngIf="selectedFile" class="selected-file">
				<mat-icon class="file-icon">
					{{ getFileIcon() }}
				</mat-icon>
				<div class="file-info">
					<span class="file-name">{{ selectedFile.name }}</span>
					<span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
				</div>
				<button
					mat-icon-button
					(click)="removeFile()"
					type="button"
					aria-label="Remove file"
				>
					<mat-icon>close</mat-icon>
				</button>
			</div>

			<p *ngIf="errorMessage" class="error-message">
				<mat-icon>error</mat-icon>
				{{ errorMessage }}
			</p>
		</div>
	`,
	styles: [
		`
			.file-upload {
				border: 2px dashed var(--border-color);
				border-radius: 8px;
				padding: 24px;
				text-align: center;
				transition: all 0.2s ease;
				background-color: var(--bg-secondary);
			}

			.file-upload:hover,
			.file-upload.dragover {
				border-color: #3f51b5;
				background-color: rgba(63, 81, 181, 0.05);
			}

			.file-upload.error {
				border-color: #f44336;
			}

			.file-upload.has-file {
				border-style: solid;
			}

			.upload-area {
				cursor: pointer;
			}

			.upload-area mat-icon {
				font-size: 48px;
				width: 48px;
				height: 48px;
				color: var(--text-secondary);
				margin-bottom: 8px;
			}

			.upload-text {
				color: var(--text-primary);
				margin: 0 0 4px;
			}

			.upload-text .link {
				color: #3f51b5;
				text-decoration: underline;
			}

			.upload-hint {
				color: var(--text-secondary);
				font-size: 0.75rem;
				margin: 0;
			}

			.selected-file {
				display: flex;
				align-items: center;
				gap: 12px;
				text-align: left;
			}

			.file-icon {
				font-size: 36px;
				width: 36px;
				height: 36px;
				color: #3f51b5;
			}

			.file-info {
				flex: 1;
				display: flex;
				flex-direction: column;
			}

			.file-name {
				color: var(--text-primary);
				font-weight: 500;
				word-break: break-all;
			}

			.file-size {
				color: var(--text-secondary);
				font-size: 0.75rem;
			}

			.error-message {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 4px;
				color: #f44336;
				font-size: 0.875rem;
				margin: 8px 0 0;
			}

			.error-message mat-icon {
				font-size: 18px;
				width: 18px;
				height: 18px;
			}
		`,
	],
})
export class FileUploadComponent {
	@Input() acceptedTypes = "image/jpeg,image/png,application/pdf";
	@Input() maxSizeMB = 5;
	@Output() fileSelected = new EventEmitter<File | null>();

	selectedFile: File | null = null;
	errorMessage = "";

	onDragOver(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
	}

	onDragLeave(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
	}

	onDrop(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			this.handleFile(files[0]);
		}
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			this.handleFile(input.files[0]);
		}
	}

	private handleFile(file: File): void {
		this.errorMessage = "";

		// Check file type
		const allowedTypes = environment.allowedFileTypes;
		if (!allowedTypes.includes(file.type)) {
			this.errorMessage = "Invalid file type. Please upload JPG, PNG, or PDF.";
			return;
		}

		// Check file size
		const maxSize = environment.maxFileSize;
		if (file.size > maxSize) {
			this.errorMessage = `File is too large. Maximum size is ${this.maxSizeMB}MB.`;
			return;
		}

		this.selectedFile = file;
		this.fileSelected.emit(file);
	}

	removeFile(): void {
		this.selectedFile = null;
		this.errorMessage = "";
		this.fileSelected.emit(null);
	}

	getFileIcon(): string {
		if (!this.selectedFile) return "insert_drive_file";

		if (this.selectedFile.type.startsWith("image/")) {
			return "image";
		}
		if (this.selectedFile.type === "application/pdf") {
			return "picture_as_pdf";
		}
		return "insert_drive_file";
	}

	formatFileSize(bytes: number): string {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	}
}
