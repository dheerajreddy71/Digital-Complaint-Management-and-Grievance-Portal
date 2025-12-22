import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";

@Injectable({
	providedIn: "root",
})
export class SnackbarService {
	private defaultConfig: MatSnackBarConfig = {
		duration: 5000,
		horizontalPosition: "end",
		verticalPosition: "top",
	};

	constructor(private snackBar: MatSnackBar) {}

	success(message: string, action = "Close"): void {
		this.snackBar.open(message, action, {
			...this.defaultConfig,
			panelClass: ["snackbar-success"],
		});
	}

	error(message: string, action = "Close"): void {
		this.snackBar.open(message, action, {
			...this.defaultConfig,
			duration: 8000,
			panelClass: ["snackbar-error"],
		});
	}

	warning(message: string, action = "Close"): void {
		this.snackBar.open(message, action, {
			...this.defaultConfig,
			panelClass: ["snackbar-warning"],
		});
	}

	info(message: string, action = "Close"): void {
		this.snackBar.open(message, action, {
			...this.defaultConfig,
			panelClass: ["snackbar-info"],
		});
	}

	show(message: string, action = "Close", config?: MatSnackBarConfig): void {
		this.snackBar.open(message, action, {
			...this.defaultConfig,
			...config,
		});
	}
}
