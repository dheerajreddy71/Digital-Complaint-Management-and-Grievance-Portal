import { Component, OnInit } from "@angular/core";
import { AuthService } from "@core/services/auth.service";
import { UserRole } from "@core/models";

@Component({
	selector: "app-dashboard",
	template: `
		<div class="page-container">
			<div *ngIf="isLoading" class="loading-container">
				<app-loading-spinner></app-loading-spinner>
			</div>
			<div *ngIf="!isLoading && !userRole" class="error-container">
				<p>Unable to determine user role. Please log in again.</p>
			</div>
			<app-user-dashboard
				*ngIf="!isLoading && userRole === UserRole.USER"
			></app-user-dashboard>
			<app-staff-dashboard
				*ngIf="!isLoading && userRole === UserRole.STAFF"
			></app-staff-dashboard>
			<app-admin-dashboard
				*ngIf="!isLoading && userRole === UserRole.ADMIN"
			></app-admin-dashboard>
		</div>
	`,
	styles: [
		`
			.page-container {
				padding: 24px;
			}
		`,
	],
})
export class DashboardComponent implements OnInit {
	userRole: string = "";
	UserRole = UserRole; // Make enum available in template
	isLoading = true;

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		const user = this.authService.currentUser;
		console.log("Dashboard - Current user:", user);
		this.userRole = user?.role || "";
		console.log("Dashboard - User role:", this.userRole);
		this.isLoading = false;
	}
}
