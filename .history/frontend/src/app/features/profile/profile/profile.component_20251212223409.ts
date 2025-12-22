import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "@core/services/auth.service";
import { UserService } from "@core/services/user.service";
import { SnackbarService } from "@core/services/snackbar.service";
import { ThemeService } from "@core/services/theme.service";
import { User } from "@core/models";

@Component({
	selector: "app-profile",
	template: `
		<div class="profile-container">
			<div class="page-header">
				<h1>My Profile</h1>
				<p class="subtitle">Manage your account settings and preferences</p>
			</div>

			<div class="profile-grid">
				<!-- Profile Information Card -->
				<mat-card class="profile-card">
					<mat-card-header>
						<mat-icon mat-card-avatar>person</mat-icon>
						<mat-card-title>Personal Information</mat-card-title>
						<mat-card-subtitle>Update your personal details</mat-card-subtitle>
					</mat-card-header>

					<mat-card-content>
						<div class="avatar-section">
							<div class="avatar-large">
								<mat-icon>person</mat-icon>
							</div>
							<div class="avatar-info">
								<h3>{{ user?.name }}</h3>
								<span class="role-badge" [class]="user?.role">{{
									user?.role | uppercase
								}}</span>
								<p class="email">{{ user?.email }}</p>
							</div>
						</div>

						<mat-divider></mat-divider>

						<form
							[formGroup]="profileForm"
							(ngSubmit)="updateProfile()"
							class="profile-form"
						>
							<mat-form-field appearance="outline" class="full-width">
								<mat-label>Full Name</mat-label>
								<input
									matInput
									formControlName="name"
									placeholder="Enter your full name"
								/>
								<mat-icon matSuffix>badge</mat-icon>
								<mat-error *ngIf="profileForm.get('name')?.hasError('required')"
									>Name is required</mat-error
								>
								<mat-error
									*ngIf="profileForm.get('name')?.hasError('minlength')"
									>Name must be at least 2 characters</mat-error
								>
							</mat-form-field>

							<mat-form-field appearance="outline" class="full-width">
								<mat-label>Email Address</mat-label>
								<input
									matInput
									formControlName="email"
									placeholder="Enter your email"
								/>
								<mat-icon matSuffix>email</mat-icon>
								<mat-error
									*ngIf="profileForm.get('email')?.hasError('required')"
									>Email is required</mat-error
								>
								<mat-error *ngIf="profileForm.get('email')?.hasError('email')"
									>Enter a valid email</mat-error
								>
							</mat-form-field>

							<mat-form-field appearance="outline" class="full-width">
								<mat-label>Phone Number</mat-label>
								<input
									matInput
									formControlName="phone"
									placeholder="Enter your phone number"
								/>
								<mat-icon matSuffix>phone</mat-icon>
								<mat-hint>Format: +1 (555) 555-5555</mat-hint>
							</mat-form-field>

							<div class="form-actions">
								<button
									mat-raised-button
									color="primary"
									type="submit"
									[disabled]="
										profileForm.invalid || profileForm.pristine || saving
									"
								>
									<mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
									<mat-icon *ngIf="!saving">save</mat-icon>
									{{ saving ? "Saving..." : "Save Changes" }}
								</button>
								<button
									mat-stroked-button
									type="button"
									(click)="resetForm()"
									[disabled]="profileForm.pristine"
								>
									<mat-icon>undo</mat-icon>
									Reset
								</button>
							</div>
						</form>
					</mat-card-content>
				</mat-card>

				<!-- Account Stats Card -->
				<mat-card class="stats-card">
					<mat-card-header>
						<mat-icon mat-card-avatar>insights</mat-icon>
						<mat-card-title>Account Statistics</mat-card-title>
						<mat-card-subtitle>Your activity summary</mat-card-subtitle>
					</mat-card-header>

					<mat-card-content>
						<div class="stats-grid">
							<div class="stat-item">
								<mat-icon>calendar_today</mat-icon>
								<div class="stat-info">
									<span class="stat-label">Member Since</span>
									<span class="stat-value">{{
										user?.created_at | date : "mediumDate"
									}}</span>
								</div>
							</div>

							<div class="stat-item">
								<mat-icon>login</mat-icon>
								<div class="stat-info">
									<span class="stat-label">Last Login</span>
									<span class="stat-value">{{
										user?.last_login | date : "medium" || "N/A"
									}}</span>
								</div>
							</div>

							<div class="stat-item" *ngIf="user?.role === 'citizen'">
								<mat-icon>report</mat-icon>
								<div class="stat-info">
									<span class="stat-label">Total Complaints</span>
									<span class="stat-value">{{
										stats?.totalComplaints || 0
									}}</span>
								</div>
							</div>

							<div class="stat-item" *ngIf="user?.role === 'citizen'">
								<mat-icon>check_circle</mat-icon>
								<div class="stat-info">
									<span class="stat-label">Resolved</span>
									<span class="stat-value">{{
										stats?.resolvedComplaints || 0
									}}</span>
								</div>
							</div>

							<div class="stat-item" *ngIf="user?.role === 'staff'">
								<mat-icon>assignment_turned_in</mat-icon>
								<div class="stat-info">
									<span class="stat-label">Handled Complaints</span>
									<span class="stat-value">{{
										stats?.handledComplaints || 0
									}}</span>
								</div>
							</div>

							<div class="stat-item" *ngIf="user?.role === 'staff'">
								<mat-icon>star</mat-icon>
								<div class="stat-info">
									<span class="stat-label">Avg. Rating</span>
									<span class="stat-value">{{
										stats?.avgRating | number : "1.1-1" || "N/A"
									}}</span>
								</div>
							</div>
						</div>
					</mat-card-content>
				</mat-card>

				<!-- Preferences Card -->
				<mat-card class="preferences-card">
					<mat-card-header>
						<mat-icon mat-card-avatar>settings</mat-icon>
						<mat-card-title>Preferences</mat-card-title>
						<mat-card-subtitle>Customize your experience</mat-card-subtitle>
					</mat-card-header>

					<mat-card-content>
						<div class="preference-item">
							<div class="preference-info">
								<mat-icon>dark_mode</mat-icon>
								<div>
									<span class="preference-label">Dark Mode</span>
									<span class="preference-desc"
										>Switch between light and dark themes</span
									>
								</div>
							</div>
							<mat-slide-toggle
								[checked]="isDarkMode"
								(change)="toggleTheme($event.checked)"
							></mat-slide-toggle>
						</div>

						<mat-divider></mat-divider>

						<div class="preference-item">
							<div class="preference-info">
								<mat-icon>notifications</mat-icon>
								<div>
									<span class="preference-label">Email Notifications</span>
									<span class="preference-desc">Receive updates via email</span>
								</div>
							</div>
							<mat-slide-toggle
								[checked]="emailNotifications"
								(change)="toggleEmailNotifications($event.checked)"
							></mat-slide-toggle>
						</div>

						<mat-divider></mat-divider>

						<div class="preference-item">
							<div class="preference-info">
								<mat-icon>campaign</mat-icon>
								<div>
									<span class="preference-label">Push Notifications</span>
									<span class="preference-desc"
										>Receive browser notifications</span
									>
								</div>
							</div>
							<mat-slide-toggle
								[checked]="pushNotifications"
								(change)="togglePushNotifications($event.checked)"
							></mat-slide-toggle>
						</div>
					</mat-card-content>
				</mat-card>

				<!-- Security Card -->
				<mat-card class="security-card">
					<mat-card-header>
						<mat-icon mat-card-avatar>security</mat-icon>
						<mat-card-title>Security</mat-card-title>
						<mat-card-subtitle>Manage your account security</mat-card-subtitle>
					</mat-card-header>

					<mat-card-content>
						<div class="security-item">
							<div class="security-info">
								<mat-icon>lock</mat-icon>
								<div>
									<span class="security-label">Password</span>
									<span class="security-desc"
										>Last changed {{ passwordLastChanged || "Never" }}</span
									>
								</div>
							</div>
							<button
								mat-stroked-button
								color="primary"
								routerLink="change-password"
							>
								<mat-icon>edit</mat-icon>
								Change
							</button>
						</div>

						<mat-divider></mat-divider>

						<div class="security-item">
							<div class="security-info">
								<mat-icon>devices</mat-icon>
								<div>
									<span class="security-label">Active Sessions</span>
									<span class="security-desc"
										>Manage your logged in devices</span
									>
								</div>
							</div>
							<button
								mat-stroked-button
								color="warn"
								(click)="logoutAllDevices()"
							>
								<mat-icon>logout</mat-icon>
								Logout All
							</button>
						</div>
					</mat-card-content>
				</mat-card>
			</div>

			<!-- Danger Zone -->
			<mat-card class="danger-zone">
				<mat-card-header>
					<mat-icon mat-card-avatar color="warn">warning</mat-icon>
					<mat-card-title>Danger Zone</mat-card-title>
					<mat-card-subtitle>Irreversible actions</mat-card-subtitle>
				</mat-card-header>

				<mat-card-content>
					<div class="danger-item">
						<div class="danger-info">
							<span class="danger-label">Delete Account</span>
							<span class="danger-desc"
								>Permanently delete your account and all associated data. This
								action cannot be undone.</span
							>
						</div>
						<button
							mat-raised-button
							color="warn"
							(click)="confirmDeleteAccount()"
						>
							<mat-icon>delete_forever</mat-icon>
							Delete Account
						</button>
					</div>
				</mat-card-content>
			</mat-card>
		</div>
	`,
	styles: [
		`
			.profile-container {
				padding: 24px;
				max-width: 1200px;
				margin: 0 auto;
			}

			.page-header {
				margin-bottom: 24px;

				h1 {
					margin: 0;
					font-size: 28px;
					font-weight: 500;
				}

				.subtitle {
					margin: 8px 0 0;
					color: var(--text-secondary);
				}
			}

			.profile-grid {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 24px;
				margin-bottom: 24px;
			}

			@media (max-width: 1024px) {
				.profile-grid {
					grid-template-columns: 1fr;
				}
			}

			@media (max-width: 768px) {
				.profile-container {
					padding: 16px;
				}

				.page-header h1 {
					font-size: 24px;
				}
			}

			mat-card {
				border-radius: 12px;
			}

			mat-card-header {
				margin-bottom: 16px;

				mat-icon[mat-card-avatar] {
					background: var(--primary-color);
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

			.avatar-section {
				display: flex;
				align-items: center;
				gap: 20px;
				padding: 16px 0;
			}

			.avatar-large {
				width: 80px;
				height: 80px;
				border-radius: 50%;
				background: linear-gradient(
					135deg,
					var(--primary-color),
					var(--accent-color)
				);
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				mat-icon {
					font-size: 48px;
					width: 48px;
					height: 48px;
					color: white;
				}
			}

			.avatar-info {
				h3 {
					margin: 0;
					font-size: 20px;
					font-weight: 500;
				}

				.email {
					margin: 4px 0 0;
					color: var(--text-secondary);
					font-size: 14px;
				}
			}

			.role-badge {
				display: inline-block;
				padding: 2px 8px;
				border-radius: 4px;
				font-size: 11px;
				font-weight: 600;
				margin-top: 4px;

				&.admin {
					background: #e91e63;
					color: white;
				}

				&.staff {
					background: #2196f3;
					color: white;
				}

				&.citizen {
					background: #4caf50;
					color: white;
				}
			}

			mat-divider {
				margin: 16px 0;
			}

			.profile-form {
				padding-top: 16px;
			}

			.full-width {
				width: 100%;
				margin-bottom: 8px;
			}

			.form-actions {
				display: flex;
				gap: 12px;
				margin-top: 16px;

				button {
					display: flex;
					align-items: center;
					gap: 8px;
				}
			}

			.stats-grid {
				display: flex;
				flex-direction: column;
				gap: 16px;
			}

			.stat-item {
				display: flex;
				align-items: center;
				gap: 16px;
				padding: 12px;
				background: var(--bg-card);
				border-radius: 8px;

				mat-icon {
					color: var(--primary-color);
					font-size: 28px;
					width: 28px;
					height: 28px;
				}
			}

			.stat-info {
				display: flex;
				flex-direction: column;
			}

			.stat-label {
				font-size: 12px;
				color: var(--text-secondary);
			}

			.stat-value {
				font-size: 16px;
				font-weight: 500;
			}

			.preference-item,
			.security-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 12px 0;
			}

			.preference-info,
			.security-info {
				display: flex;
				align-items: center;
				gap: 16px;

				mat-icon {
					color: var(--text-secondary);
				}
			}

			.preference-label,
			.security-label {
				display: block;
				font-weight: 500;
			}

			.preference-desc,
			.security-desc {
				display: block;
				font-size: 12px;
				color: var(--text-secondary);
			}

			.danger-zone {
				border: 1px solid var(--warn-color);

				mat-icon[mat-card-avatar] {
					background: var(--warn-color) !important;
				}
			}

			.danger-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 24px;
			}

			.danger-info {
				flex: 1;
			}

			.danger-label {
				display: block;
				font-weight: 500;
				color: var(--warn-color);
			}

			.danger-desc {
				display: block;
				font-size: 13px;
				color: var(--text-secondary);
				margin-top: 4px;
			}

			@media (max-width: 600px) {
				.danger-item {
					flex-direction: column;
					align-items: flex-start;

					button {
						width: 100%;
					}
				}

				.preference-item,
				.security-item {
					flex-direction: column;
					align-items: flex-start;
					gap: 12px;
				}

				.avatar-section {
					flex-direction: column;
					text-align: center;
				}
			}
		`,
	],
})
export class ProfileComponent implements OnInit {
	user: User | null = null;
	profileForm: FormGroup;
	saving = false;
	isDarkMode = false;
	emailNotifications = true;
	pushNotifications = false;
	passwordLastChanged = "Never";

	stats = {
		totalComplaints: 0,
		resolvedComplaints: 0,
		handledComplaints: 0,
		avgRating: 0,
	};

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private userService: UserService,
		private snackbar: SnackbarService,
		private themeService: ThemeService
	) {
		this.profileForm = this.fb.group({
			name: ["", [Validators.required, Validators.minLength(2)]],
			email: ["", [Validators.required, Validators.email]],
			phone: [""],
		});
	}

	ngOnInit(): void {
		this.authService.currentUser$.subscribe((user) => {
			this.user = user;
			if (user) {
				this.profileForm.patchValue({
					name: user.name,
					email: user.email,
					phone: user.phone || "",
				});
			}
		});

		this.themeService.isDarkMode$.subscribe((isDark) => {
			this.isDarkMode = isDark;
		});

		this.loadUserStats();
		this.loadPreferences();
	}

	loadUserStats(): void {
		// In a real app, this would call a service to get user stats
		// Simulating with mock data
		if (this.user?.role === "citizen") {
			this.stats.totalComplaints = 12;
			this.stats.resolvedComplaints = 8;
		} else if (this.user?.role === "staff") {
			this.stats.handledComplaints = 156;
			this.stats.avgRating = 4.7;
		}
	}

	loadPreferences(): void {
		// Load from localStorage or user settings
		const prefs = localStorage.getItem("userPreferences");
		if (prefs) {
			const parsed = JSON.parse(prefs);
			this.emailNotifications = parsed.emailNotifications ?? true;
			this.pushNotifications = parsed.pushNotifications ?? false;
		}
	}

	updateProfile(): void {
		if (this.profileForm.valid) {
			this.saving = true;
			const data = this.profileForm.value;

			this.userService.updateProfile(data).subscribe({
				next: (updated) => {
					this.saving = false;
					this.authService.updateCurrentUser(updated);
					this.snackbar.success("Profile updated successfully");
					this.profileForm.markAsPristine();
				},
				error: (err) => {
					this.saving = false;
					this.snackbar.error(err.error?.message || "Failed to update profile");
				},
			});
		}
	}

	resetForm(): void {
		if (this.user) {
			this.profileForm.patchValue({
				name: this.user.name,
				email: this.user.email,
				phone: this.user.phone || "",
			});
			this.profileForm.markAsPristine();
		}
	}

	toggleTheme(isDark: boolean): void {
		this.themeService.setDarkMode(isDark);
	}

	toggleEmailNotifications(enabled: boolean): void {
		this.emailNotifications = enabled;
		this.savePreferences();
		this.snackbar.success(
			`Email notifications ${enabled ? "enabled" : "disabled"}`
		);
	}

	togglePushNotifications(enabled: boolean): void {
		this.pushNotifications = enabled;
		this.savePreferences();

		if (enabled && "Notification" in window) {
			Notification.requestPermission().then((permission) => {
				if (permission !== "granted") {
					this.pushNotifications = false;
					this.savePreferences();
					this.snackbar.warning("Push notifications were denied by browser");
				}
			});
		}
	}

	savePreferences(): void {
		localStorage.setItem(
			"userPreferences",
			JSON.stringify({
				emailNotifications: this.emailNotifications,
				pushNotifications: this.pushNotifications,
			})
		);
	}

	logoutAllDevices(): void {
		// In a real app, this would call the auth service to invalidate all sessions
		this.snackbar.success("Logged out from all other devices");
	}

	confirmDeleteAccount(): void {
		const confirmed = window.confirm(
			"Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
		);

		if (confirmed) {
			const doubleConfirm = window.prompt(
				'Type "DELETE" to confirm account deletion:'
			);
			if (doubleConfirm === "DELETE") {
				// Call delete account API
				this.snackbar.success(
					"Account deletion requested. You will receive a confirmation email."
				);
			}
		}
	}
}
