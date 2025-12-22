import { Component } from "@angular/core";
import {
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl,
	ValidationErrors,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "@core/services/auth.service";
import { SnackbarService } from "@core/services/snackbar.service";

@Component({
	selector: "app-change-password",
	template: `
		<div class="change-password-container">
			<div class="page-header">
				<button mat-icon-button routerLink="/profile" class="back-btn">
					<mat-icon>arrow_back</mat-icon>
				</button>
				<div>
					<h1>Change Password</h1>
					<p class="subtitle">Update your account password</p>
				</div>
			</div>

			<mat-card class="password-card">
				<mat-card-content>
					<div class="security-illustration">
						<mat-icon>lock</mat-icon>
					</div>

					<form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
						<!-- Current Password -->
						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Current Password</mat-label>
							<input
								matInput
								[type]="hideCurrentPassword ? 'password' : 'text'"
								formControlName="currentPassword"
								placeholder="Enter your current password"
							/>
							<button
								mat-icon-button
								matSuffix
								type="button"
								(click)="hideCurrentPassword = !hideCurrentPassword"
							>
								<mat-icon>{{
									hideCurrentPassword ? "visibility_off" : "visibility"
								}}</mat-icon>
							</button>
							<mat-error
								*ngIf="
									passwordForm.get('currentPassword')?.hasError('required')
								"
							>
								Current password is required
							</mat-error>
						</mat-form-field>

						<!-- New Password -->
						<mat-form-field appearance="outline" class="full-width">
							<mat-label>New Password</mat-label>
							<input
								matInput
								[type]="hideNewPassword ? 'password' : 'text'"
								formControlName="newPassword"
								placeholder="Enter your new password"
							/>
							<button
								mat-icon-button
								matSuffix
								type="button"
								(click)="hideNewPassword = !hideNewPassword"
							>
								<mat-icon>{{
									hideNewPassword ? "visibility_off" : "visibility"
								}}</mat-icon>
							</button>
							<mat-error
								*ngIf="passwordForm.get('newPassword')?.hasError('required')"
							>
								New password is required
							</mat-error>
							<mat-error
								*ngIf="passwordForm.get('newPassword')?.hasError('minlength')"
							>
								Password must be at least 8 characters
							</mat-error>
							<mat-error
								*ngIf="passwordForm.get('newPassword')?.hasError('pattern')"
							>
								Password must contain uppercase, lowercase, number and special
								character
							</mat-error>
						</mat-form-field>

						<!-- Password Strength Indicator -->
						<div
							class="password-strength"
							*ngIf="passwordForm.get('newPassword')?.value"
						>
							<div class="strength-bar">
								<div
									class="strength-fill"
									[style.width.%]="passwordStrength"
									[class.weak]="passwordStrength <= 25"
									[class.fair]="passwordStrength > 25 && passwordStrength <= 50"
									[class.good]="passwordStrength > 50 && passwordStrength <= 75"
									[class.strong]="passwordStrength > 75"
								></div>
							</div>
							<span class="strength-text" [class]="strengthClass">{{
								strengthText
							}}</span>
						</div>

						<!-- Password Requirements -->
						<div class="password-requirements">
							<p class="requirements-title">Password must contain:</p>
							<ul>
								<li [class.met]="hasMinLength">
									<mat-icon>{{
										hasMinLength ? "check_circle" : "radio_button_unchecked"
									}}</mat-icon>
									At least 8 characters
								</li>
								<li [class.met]="hasUppercase">
									<mat-icon>{{
										hasUppercase ? "check_circle" : "radio_button_unchecked"
									}}</mat-icon>
									One uppercase letter
								</li>
								<li [class.met]="hasLowercase">
									<mat-icon>{{
										hasLowercase ? "check_circle" : "radio_button_unchecked"
									}}</mat-icon>
									One lowercase letter
								</li>
								<li [class.met]="hasNumber">
									<mat-icon>{{
										hasNumber ? "check_circle" : "radio_button_unchecked"
									}}</mat-icon>
									One number
								</li>
								<li [class.met]="hasSpecial">
									<mat-icon>{{
										hasSpecial ? "check_circle" : "radio_button_unchecked"
									}}</mat-icon>
									One special character (!&#64;#$%^&*)
								</li>
							</ul>
						</div>

						<!-- Confirm Password -->
						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Confirm New Password</mat-label>
							<input
								matInput
								[type]="hideConfirmPassword ? 'password' : 'text'"
								formControlName="confirmPassword"
								placeholder="Confirm your new password"
							/>
							<button
								mat-icon-button
								matSuffix
								type="button"
								(click)="hideConfirmPassword = !hideConfirmPassword"
							>
								<mat-icon>{{
									hideConfirmPassword ? "visibility_off" : "visibility"
								}}</mat-icon>
							</button>
							<mat-error
								*ngIf="
									passwordForm.get('confirmPassword')?.hasError('required')
								"
							>
								Please confirm your password
							</mat-error>
							<mat-error
								*ngIf="
									passwordForm
										.get('confirmPassword')
										?.hasError('passwordMismatch')
								"
							>
								Passwords do not match
							</mat-error>
						</mat-form-field>

						<!-- Match indicator -->
						<div
							class="match-indicator"
							*ngIf="
								passwordForm.get('confirmPassword')?.value &&
								!passwordForm
									.get('confirmPassword')
									?.hasError('passwordMismatch')
							"
						>
							<mat-icon>check_circle</mat-icon>
							<span>Passwords match</span>
						</div>

						<div class="form-actions">
							<button mat-stroked-button type="button" routerLink="/profile">
								Cancel
							</button>
							<button
								mat-raised-button
								color="primary"
								type="submit"
								[disabled]="passwordForm.invalid || saving"
							>
								<mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
								<mat-icon *ngIf="!saving">lock</mat-icon>
								{{ saving ? "Updating..." : "Update Password" }}
							</button>
						</div>
					</form>
				</mat-card-content>
			</mat-card>

			<!-- Security Tips -->
			<mat-card class="tips-card">
				<mat-card-header>
					<mat-icon mat-card-avatar>tips_and_updates</mat-icon>
					<mat-card-title>Security Tips</mat-card-title>
				</mat-card-header>
				<mat-card-content>
					<ul class="tips-list">
						<li>
							<mat-icon>shield</mat-icon>
							<span
								>Use a unique password that you don't use for other
								accounts</span
							>
						</li>
						<li>
							<mat-icon>vpn_key</mat-icon>
							<span
								>Consider using a password manager to generate and store strong
								passwords</span
							>
						</li>
						<li>
							<mat-icon>refresh</mat-icon>
							<span
								>Change your password regularly, at least every 90 days</span
							>
						</li>
						<li>
							<mat-icon>warning</mat-icon>
							<span
								>Never share your password with anyone, including support
								staff</span
							>
						</li>
					</ul>
				</mat-card-content>
			</mat-card>
		</div>
	`,
	styles: [
		`
			.change-password-container {
				padding: 24px;
				max-width: 600px;
				margin: 0 auto;
			}

			.page-header {
				display: flex;
				align-items: flex-start;
				gap: 16px;
				margin-bottom: 24px;

				.back-btn {
					margin-top: 4px;
				}

				h1 {
					margin: 0;
					font-size: 28px;
					font-weight: 500;
				}

				.subtitle {
					margin: 4px 0 0;
					color: var(--text-secondary);
				}
			}

			mat-card {
				border-radius: 12px;
				margin-bottom: 24px;
			}

			.security-illustration {
				display: flex;
				justify-content: center;
				padding: 24px 0;

				mat-icon {
					font-size: 64px;
					width: 64px;
					height: 64px;
					color: var(--primary-color);
					background: var(--bg-card);
					padding: 24px;
					border-radius: 50%;
				}
			}

			.full-width {
				width: 100%;
			}

			.password-strength {
				margin: -8px 0 16px;

				.strength-bar {
					height: 4px;
					background: var(--border-color);
					border-radius: 2px;
					overflow: hidden;
				}

				.strength-fill {
					height: 100%;
					transition: width 0.3s, background 0.3s;

					&.weak {
						background: #f44336;
					}
					&.fair {
						background: #ff9800;
					}
					&.good {
						background: #2196f3;
					}
					&.strong {
						background: #4caf50;
					}
				}

				.strength-text {
					font-size: 12px;
					margin-top: 4px;
					display: block;

					&.weak {
						color: #f44336;
					}
					&.fair {
						color: #ff9800;
					}
					&.good {
						color: #2196f3;
					}
					&.strong {
						color: #4caf50;
					}
				}
			}

			.password-requirements {
				background: var(--bg-card);
				border-radius: 8px;
				padding: 16px;
				margin-bottom: 16px;

				.requirements-title {
					margin: 0 0 8px;
					font-size: 13px;
					font-weight: 500;
					color: var(--text-secondary);
				}

				ul {
					list-style: none;
					padding: 0;
					margin: 0;
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 8px;
				}

				li {
					display: flex;
					align-items: center;
					gap: 8px;
					font-size: 12px;
					color: var(--text-secondary);

					mat-icon {
						font-size: 16px;
						width: 16px;
						height: 16px;
					}

					&.met {
						color: #4caf50;

						mat-icon {
							color: #4caf50;
						}
					}
				}
			}

			@media (max-width: 480px) {
				.password-requirements ul {
					grid-template-columns: 1fr;
				}
			}

			.match-indicator {
				display: flex;
				align-items: center;
				gap: 8px;
				color: #4caf50;
				font-size: 13px;
				margin: -8px 0 16px;

				mat-icon {
					font-size: 18px;
					width: 18px;
					height: 18px;
				}
			}

			.form-actions {
				display: flex;
				justify-content: flex-end;
				gap: 12px;
				margin-top: 24px;

				button {
					display: flex;
					align-items: center;
					gap: 8px;
				}
			}

			.tips-card {
				mat-icon[mat-card-avatar] {
					background: #ff9800;
					color: white;
					padding: 8px;
					border-radius: 50%;
					font-size: 24px;
					width: 40px;
					height: 40px;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}

			.tips-list {
				list-style: none;
				padding: 0;
				margin: 0;

				li {
					display: flex;
					align-items: flex-start;
					gap: 12px;
					padding: 12px 0;
					border-bottom: 1px solid var(--border-color);

					&:last-child {
						border-bottom: none;
					}

					mat-icon {
						color: var(--primary-color);
						flex-shrink: 0;
					}

					span {
						font-size: 14px;
						color: var(--text-secondary);
					}
				}
			}

			@media (max-width: 600px) {
				.change-password-container {
					padding: 16px;
				}

				.page-header h1 {
					font-size: 22px;
				}

				.form-actions {
					flex-direction: column;

					button {
						width: 100%;
						justify-content: center;
					}
				}
			}
		`,
	],
})
export class ChangePasswordComponent {
	passwordForm: FormGroup;
	saving = false;
	hideCurrentPassword = true;
	hideNewPassword = true;
	hideConfirmPassword = true;

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private snackbar: SnackbarService,
		private router: Router
	) {
		this.passwordForm = this.fb.group(
			{
				currentPassword: ["", Validators.required],
				newPassword: [
					"",
					[
						Validators.required,
						Validators.minLength(8),
						Validators.pattern(
							/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/
						),
					],
				],
				confirmPassword: ["", Validators.required],
			},
			{ validators: this.passwordMatchValidator }
		);
	}

	passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
		const newPassword = control.get("newPassword");
		const confirmPassword = control.get("confirmPassword");

		if (
			newPassword &&
			confirmPassword &&
			newPassword.value !== confirmPassword.value
		) {
			confirmPassword.setErrors({ passwordMismatch: true });
			return { passwordMismatch: true };
		}

		return null;
	}

	get passwordStrength(): number {
		const password = this.passwordForm.get("newPassword")?.value || "";
		let strength = 0;

		if (password.length >= 8) strength += 20;
		if (password.length >= 12) strength += 10;
		if (/[A-Z]/.test(password)) strength += 20;
		if (/[a-z]/.test(password)) strength += 15;
		if (/\d/.test(password)) strength += 20;
		if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;

		return Math.min(strength, 100);
	}

	get strengthText(): string {
		const strength = this.passwordStrength;
		if (strength <= 25) return "Weak";
		if (strength <= 50) return "Fair";
		if (strength <= 75) return "Good";
		return "Strong";
	}

	get strengthClass(): string {
		const strength = this.passwordStrength;
		if (strength <= 25) return "weak";
		if (strength <= 50) return "fair";
		if (strength <= 75) return "good";
		return "strong";
	}

	get hasMinLength(): boolean {
		return (this.passwordForm.get("newPassword")?.value || "").length >= 8;
	}

	get hasUppercase(): boolean {
		return /[A-Z]/.test(this.passwordForm.get("newPassword")?.value || "");
	}

	get hasLowercase(): boolean {
		return /[a-z]/.test(this.passwordForm.get("newPassword")?.value || "");
	}

	get hasNumber(): boolean {
		return /\d/.test(this.passwordForm.get("newPassword")?.value || "");
	}

	get hasSpecial(): boolean {
		return /[!@#$%^&*]/.test(this.passwordForm.get("newPassword")?.value || "");
	}

	changePassword(): void {
		if (this.passwordForm.valid) {
			this.saving = true;

			const { currentPassword, newPassword } = this.passwordForm.value;

			this.authService.changePassword(currentPassword, newPassword).subscribe({
				next: () => {
					this.saving = false;
					this.snackbar.success("Password changed successfully");
					this.router.navigate(["/profile"]);
				},
				error: (err) => {
					this.saving = false;
					this.snackbar.error(
						err.error?.message || "Failed to change password"
					);
				},
			});
		}
	}
}
