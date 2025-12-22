import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { UserService } from "@core/services/user.service";
import { SnackbarService } from "@core/services/snackbar.service";
import { ConfirmDialogComponent } from "@shared/components/confirm-dialog/confirm-dialog.component";
import { User, UserRole } from "@core/models";

@Component({
	selector: "app-user-management",
	template: `
		<div class="page-container">
			<div class="page-header fade-in">
				<div class="header-left">
					<h1>User Management</h1>
					<p class="subtitle">Manage system users and their roles</p>
				</div>
				<button mat-raised-button color="primary" (click)="openCreateDialog()">
					<mat-icon>person_add</mat-icon>
					Add User
				</button>
			</div>

			<!-- Filters -->
			<mat-card class="filters-card fade-in">
				<div class="filters-row">
					<mat-form-field appearance="outline" class="search-field">
						<mat-label>Search users</mat-label>
						<mat-icon matPrefix>search</mat-icon>
						<input
							matInput
							(keyup)="applyFilter($event)"
							placeholder="Search by name or email"
						/>
					</mat-form-field>

					<mat-form-field appearance="outline">
						<mat-label>Role</mat-label>
						<mat-select
							[(ngModel)]="roleFilter"
							(selectionChange)="filterByRole()"
						>
							<mat-option value="">All Roles</mat-option>
							<mat-option value="user">User</mat-option>
							<mat-option value="staff">Staff</mat-option>
							<mat-option value="admin">Admin</mat-option>
						</mat-select>
					</mat-form-field>
				</div>
			</mat-card>

			<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

			<!-- Users Table -->
			<mat-card class="table-card fade-in" *ngIf="!isLoading">
				<div class="table-container">
					<table mat-table [dataSource]="dataSource" matSort>
						<ng-container matColumnDef="name">
							<th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
							<td mat-cell *matCellDef="let user">
								<div class="user-cell">
									<div class="user-avatar">
										{{ user.name.charAt(0).toUpperCase() }}
									</div>
									<div class="user-info">
										<span class="user-name">{{ user.name }}</span>
										<span class="user-email">{{ user.email }}</span>
									</div>
								</div>
							</td>
						</ng-container>

						<ng-container matColumnDef="role">
							<th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
							<td mat-cell *matCellDef="let user">
								<span class="role-badge" [class]="'role-' + user.role">
									{{ user.role | titlecase }}
								</span>
							</td>
						</ng-container>

						<ng-container matColumnDef="phone">
							<th mat-header-cell *matHeaderCellDef>Phone</th>
							<td mat-cell *matCellDef="let user">
								{{ user.phone || "-" }}
							</td>
						</ng-container>

						<ng-container matColumnDef="created_at">
							<th mat-header-cell *matHeaderCellDef mat-sort-header>Joined</th>
							<td mat-cell *matCellDef="let user">
								{{ user.created_at | date : "mediumDate" }}
							</td>
						</ng-container>

						<ng-container matColumnDef="actions">
							<th mat-header-cell *matHeaderCellDef>Actions</th>
							<td mat-cell *matCellDef="let user">
								<button
									mat-icon-button
									[matMenuTriggerFor]="actionMenu"
									[disabled]="user.role === 'admin'"
								>
									<mat-icon>more_vert</mat-icon>
								</button>
								<mat-menu #actionMenu="matMenu">
									<button mat-menu-item (click)="openEditDialog(user)">
										<mat-icon>edit</mat-icon>
										<span>Edit</span>
									</button>
									<button mat-menu-item (click)="changeRole(user)">
										<mat-icon>swap_horiz</mat-icon>
										<span>Change Role</span>
									</button>
									<mat-divider></mat-divider>
									<button
										mat-menu-item
										(click)="deleteUser(user)"
										class="delete-action"
									>
										<mat-icon color="warn">delete</mat-icon>
										<span>Delete</span>
									</button>
								</mat-menu>
							</td>
						</ng-container>

						<tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
						<tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
					</table>
				</div>

				<mat-paginator
					[pageSizeOptions]="[10, 25, 50]"
					showFirstLastButtons
				></mat-paginator>
			</mat-card>

			<!-- Create/Edit Dialog -->
			<ng-template #userDialog>
				<h2 mat-dialog-title>
					{{ isEditMode ? "Edit User" : "Create New User" }}
				</h2>
				<mat-dialog-content>
					<form [formGroup]="userForm" class="user-form">
						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Full Name</mat-label>
							<input
								matInput
								formControlName="name"
								placeholder="Enter full name"
							/>
							<mat-error *ngIf="userForm.get('name')?.hasError('required')">
								Name is required
							</mat-error>
						</mat-form-field>

						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Email</mat-label>
							<input
								matInput
								formControlName="email"
								type="email"
								placeholder="Enter email address"
							/>
							<mat-error *ngIf="userForm.get('email')?.hasError('required')">
								Email is required
							</mat-error>
							<mat-error *ngIf="userForm.get('email')?.hasError('email')">
								Please enter a valid email
							</mat-error>
						</mat-form-field>

						<mat-form-field
							appearance="outline"
							class="full-width"
							*ngIf="!isEditMode"
						>
							<mat-label>Password</mat-label>
							<input
								matInput
								formControlName="password"
								type="password"
								placeholder="Enter password"
							/>
							<mat-error *ngIf="userForm.get('password')?.hasError('required')">
								Password is required
							</mat-error>
							<mat-error
								*ngIf="userForm.get('password')?.hasError('minlength')"
							>
								Password must be at least 8 characters
							</mat-error>
						</mat-form-field>

						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Phone</mat-label>
							<input
								matInput
								formControlName="phone"
								placeholder="Enter phone number"
							/>
						</mat-form-field>

						<mat-form-field appearance="outline" class="full-width">
							<mat-label>Role</mat-label>
							<mat-select formControlName="role">
								<mat-option value="user">User</mat-option>
								<mat-option value="staff">Staff</mat-option>
								<mat-option value="admin">Admin</mat-option>
							</mat-select>
						</mat-form-field>
					</form>
				</mat-dialog-content>
				<mat-dialog-actions align="end">
					<button mat-button mat-dialog-close>Cancel</button>
					<button
						mat-raised-button
						color="primary"
						[disabled]="userForm.invalid || isSaving"
						(click)="saveUser()"
					>
						<mat-spinner *ngIf="isSaving" diameter="18"></mat-spinner>
						<span *ngIf="!isSaving">{{
							isEditMode ? "Update" : "Create"
						}}</span>
					</button>
				</mat-dialog-actions>
			</ng-template>
		</div>
	`,
	styles: [
		`
			.page-header {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 24px;
				flex-wrap: wrap;
				gap: 16px;
			}

			.page-header h1 {
				margin: 0 0 4px;
			}

			.subtitle {
				margin: 0;
				color: var(--text-secondary);
			}

			.filters-card {
				margin-bottom: 24px;
				padding: 16px;
			}

			.filters-row {
				display: flex;
				gap: 16px;
				align-items: center;
				flex-wrap: wrap;
			}

			.search-field {
				flex: 1;
				min-width: 250px;
			}

			.table-card {
				overflow: hidden;
			}

			.table-container {
				overflow-x: auto;
			}

			table {
				width: 100%;
			}

			.user-cell {
				display: flex;
				align-items: center;
				gap: 12px;
			}

			.user-avatar {
				width: 40px;
				height: 40px;
				border-radius: 50%;
				background: linear-gradient(
					135deg,
					var(--primary-color),
					var(--accent-color)
				);
				display: flex;
				align-items: center;
				justify-content: center;
				color: white;
				font-weight: 500;
			}

			.user-info {
				display: flex;
				flex-direction: column;
			}

			.user-name {
				font-weight: 500;
			}

			.user-email {
				font-size: 0.75rem;
				color: var(--text-secondary);
			}

			.role-badge {
				padding: 4px 12px;
				border-radius: 16px;
				font-size: 0.75rem;
				font-weight: 500;
				text-transform: uppercase;
			}

			.role-user {
				background-color: rgba(33, 150, 243, 0.15);
				color: #2196f3;
			}

			.role-staff {
				background-color: rgba(76, 175, 80, 0.15);
				color: #4caf50;
			}

			.role-admin {
				background-color: rgba(156, 39, 176, 0.15);
				color: #9c27b0;
			}

			.delete-action {
				color: #f44336;
			}

			.user-form {
				display: flex;
				flex-direction: column;
				gap: 8px;
				min-width: 350px;
			}

			.full-width {
				width: 100%;
			}

			mat-dialog-actions button mat-spinner {
				display: inline-block;
				margin-right: 8px;
			}

			@media (max-width: 600px) {
				.filters-row {
					flex-direction: column;
					align-items: stretch;
				}

				.search-field {
					min-width: 100%;
				}

				.user-form {
					min-width: auto;
				}
			}
		`,
	],
})
export class UserManagementComponent implements OnInit {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild("userDialog") userDialog: any;

	dataSource = new MatTableDataSource<User>([]);
	displayedColumns = ["name", "role", "phone", "created_at", "actions"];

	userForm!: FormGroup;
	isLoading = true;
	isSaving = false;
	isEditMode = false;
	roleFilter = "";

	private allUsers: User[] = [];
	private editingUser: User | null = null;

	constructor(
		private fb: FormBuilder,
		private dialog: MatDialog,
		private userService: UserService,
		private snackbar: SnackbarService
	) {}

	ngOnInit(): void {
		this.initForm();
		this.loadUsers();
	}

	private initForm(): void {
		this.userForm = this.fb.group({
			name: ["", Validators.required],
			email: ["", [Validators.required, Validators.email]],
			password: ["", [Validators.required, Validators.minLength(8)]],
			phone: [""],
			role: [UserRole.CITIZEN],
		});
	}

	private loadUsers(): void {
		this.userService.getAllUsers().subscribe({
			next: (users) => {
				this.allUsers = users.data;
				this.dataSource.data = users.data;
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	filterByRole(): void {
		if (this.roleFilter) {
			this.dataSource.data = this.allUsers.filter(
				(u) => u.role === this.roleFilter
			);
		} else {
			this.dataSource.data = this.allUsers;
		}
	}

	openCreateDialog(): void {
		this.isEditMode = false;
		this.editingUser = null;
		this.userForm.reset({ role: UserRole.CITIZEN });
		this.userForm
			.get("password")
			?.setValidators([Validators.required, Validators.minLength(8)]);
		this.userForm.get("password")?.updateValueAndValidity();

		this.dialog.open(this.userDialog, {
			width: "450px",
		});
	}

	openEditDialog(user: User): void {
		this.isEditMode = true;
		this.editingUser = user;
		this.userForm.patchValue({
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
		});
		this.userForm.get("password")?.clearValidators();
		this.userForm.get("password")?.updateValueAndValidity();

		this.dialog.open(this.userDialog, {
			width: "450px",
		});
	}

	saveUser(): void {
		if (this.userForm.invalid) return;

		this.isSaving = true;
		const data = this.userForm.value;

		if (this.isEditMode && this.editingUser) {
			delete data.password;
			this.userService.updateUser(this.editingUser.id, data).subscribe({
				next: (updated) => {
					const index = this.allUsers.findIndex((u) => u.id === updated.id);
					if (index !== -1) {
						this.allUsers[index] = updated;
					}
					this.dataSource.data = [...this.allUsers];
					this.dialog.closeAll();
					this.isSaving = false;
					this.snackbar.success("User updated successfully");
				},
				error: () => {
					this.isSaving = false;
				},
			});
		} else {
			this.userService.createUser(data).subscribe({
				next: (user) => {
					this.allUsers.push(user);
					this.dataSource.data = [...this.allUsers];
					this.dialog.closeAll();
					this.isSaving = false;
					this.snackbar.success("User created successfully");
				},
				error: () => {
					this.isSaving = false;
				},
			});
		}
	}

	changeRole(user: User): void {
		const roles = [UserRole.CITIZEN, UserRole.STAFF, UserRole.ADMIN];
		const currentIndex = roles.indexOf(user.role);
		const nextRole = roles[(currentIndex + 1) % roles.length];

		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			data: {
				title: "Change User Role",
				message: `Change ${user.name}'s role from ${user.role} to ${nextRole}?`,
				confirmText: "Change Role",
			},
		});

		dialogRef.afterClosed().subscribe((confirmed) => {
			if (confirmed) {
				this.userService.updateUser(user.id, { role: nextRole }).subscribe({
					next: (updated) => {
						const index = this.allUsers.findIndex((u) => u.id === updated.id);
						if (index !== -1) {
							this.allUsers[index] = updated;
						}
						this.dataSource.data = [...this.allUsers];
						this.snackbar.success("Role updated successfully");
					},
				});
			}
		});
	}

	deleteUser(user: User): void {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			data: {
				title: "Delete User",
				message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
				confirmText: "Delete",
				confirmColor: "warn",
			},
		});

		dialogRef.afterClosed().subscribe((confirmed) => {
			if (confirmed) {
				this.userService.deleteUser(user.id).subscribe({
					next: () => {
						this.allUsers = this.allUsers.filter((u) => u.id !== user.id);
						this.dataSource.data = [...this.allUsers];
						this.snackbar.success("User deleted successfully");
					},
				});
			}
		});
	}
}
