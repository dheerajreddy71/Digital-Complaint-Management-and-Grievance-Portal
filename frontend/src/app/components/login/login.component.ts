import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../services/auth.service";

@Component({
	selector: "app-login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
	loginForm: FormGroup;
	isLoading = false;
	hidePassword = true;
	returnUrl: string = "/";

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		private snackBar: MatSnackBar
	) {
		this.loginForm = this.fb.group({
			email: ["", [Validators.required, Validators.email]],
			password: ["", [Validators.required, Validators.minLength(6)]],
		});
	}

	ngOnInit(): void {
		this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
	}

	onSubmit(): void {
		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			return;
		}

		this.isLoading = true;

		this.authService.login(this.loginForm.value).subscribe({
			next: (response) => {
				this.isLoading = false;
				if (response.success && response.user) {
					this.snackBar.open("Login successful! Welcome back.", "Close", {
						duration: 3000,
						horizontalPosition: "end",
						verticalPosition: "top",
						panelClass: ["success-snackbar"],
					});

					switch (response.user.role) {
						case "Admin":
							this.router.navigate(["/admin"]);
							break;
						case "Staff":
							this.router.navigate(["/staff"]);
							break;
						default:
							this.router.navigate(["/dashboard"]);
					}
				}
			},
			error: (error) => {
				this.isLoading = false;
				console.error("Login error:", error);

				let errorMessage = "Login failed. Please check your credentials.";

				if (error?.error?.message) {
					errorMessage = error.error.message;
				} else if (error?.status === 0) {
					errorMessage =
						"Cannot connect to server. Please check your internet connection.";
				} else if (error?.status === 401) {
					errorMessage = "Invalid email or password. Please try again.";
				} else if (error?.status === 429) {
					errorMessage = "Too many login attempts. Please try again later.";
				}

				this.snackBar.open(errorMessage, "Close", {
					duration: 8000,
					panelClass: ["error-snackbar"],
				});
			},
		});
	}

	getErrorMessage(field: string): string {
		const control = this.loginForm.get(field);

		if (control?.hasError("required")) {
			return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
		}
		if (control?.hasError("email")) {
			return "Please enter a valid email address";
		}
		if (control?.hasError("minlength")) {
			return "Password must be at least 6 characters";
		}
		return "";
	}
}
