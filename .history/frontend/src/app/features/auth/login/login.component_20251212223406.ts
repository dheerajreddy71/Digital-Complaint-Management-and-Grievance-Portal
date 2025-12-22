import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "@core/services/auth.service";
import { SnackbarService } from "@core/services/snackbar.service";

@Component({
	selector: "app-login",
	template: `
		<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
			<mat-form-field appearance="outline" class="form-field-full">
				<mat-label>Email</mat-label>
				<input
					matInput
					type="email"
					formControlName="email"
					placeholder="Enter your email"
					autocomplete="email"
				/>
				<mat-icon matPrefix>email</mat-icon>
				<mat-error *ngIf="loginForm.get('email')?.hasError('required')">
					Email is required
				</mat-error>
				<mat-error *ngIf="loginForm.get('email')?.hasError('email')">
					Please enter a valid email
				</mat-error>
			</mat-form-field>

			<mat-form-field appearance="outline" class="form-field-full">
				<mat-label>Password</mat-label>
				<input
					matInput
					[type]="hidePassword ? 'password' : 'text'"
					formControlName="password"
					placeholder="Enter your password"
					autocomplete="current-password"
				/>
				<mat-icon matPrefix>lock</mat-icon>
				<button
					mat-icon-button
					matSuffix
					type="button"
					(click)="hidePassword = !hidePassword"
					[attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'"
				>
					<mat-icon>{{
						hidePassword ? "visibility_off" : "visibility"
					}}</mat-icon>
				</button>
				<mat-error *ngIf="loginForm.get('password')?.hasError('required')">
					Password is required
				</mat-error>
			</mat-form-field>

			<button
				mat-flat-button
				color="primary"
				type="submit"
				class="submit-button"
				[disabled]="loginForm.invalid || isLoading"
			>
				<mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
				<span *ngIf="!isLoading">Sign In</span>
			</button>

			<div class="auth-footer">
				<span>Don't have an account?</span>
				<a routerLink="/auth/register">Create one</a>
			</div>
		</form>
	`,
	styles: [
		`
			form {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.form-field-full {
				width: 100%;
			}

			.submit-button {
				width: 100%;
				height: 48px;
				font-size: 1rem;
				margin-top: 8px;
			}

			.submit-button mat-spinner {
				display: inline-block;
			}

			.auth-footer {
				text-align: center;
				margin-top: 16px;
				color: var(--text-secondary);
			}

			.auth-footer a {
				color: #3f51b5;
				text-decoration: none;
				font-weight: 500;
				margin-left: 4px;
			}

			.auth-footer a:hover {
				text-decoration: underline;
			}
		`,
	],
})
export class LoginComponent {
	loginForm: FormGroup;
	hidePassword = true;
	isLoading = false;

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		private snackbar: SnackbarService
	) {
		this.loginForm = this.fb.group({
			email: ["", [Validators.required, Validators.email]],
			password: ["", [Validators.required]],
		});
	}

	onSubmit(): void {
		if (this.loginForm.invalid) return;

		this.isLoading = true;
		const { email, password } = this.loginForm.value;

		this.authService.login({ email, password }).subscribe({
			next: () => {
				this.snackbar.success("Login successful!");
				const returnUrl =
					this.route.snapshot.queryParams["returnUrl"] || "/dashboard";
				this.router.navigateByUrl(returnUrl);
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}
}
