import { Component, OnInit } from "@angular/core";
import { AuthService } from "@core/services/auth.service";
import { UserRole } from "@core/models";

@Component({
	selector: "app-dashboard",
	template: `
		<div class="page-container">
			<app-user-dashboard
				*ngIf="userRole === UserRole.CITIZEN"
			></app-user-dashboard>
			<app-staff-dashboard
				*ngIf="userRole === UserRole.STAFF"
			></app-staff-dashboard>
			<app-admin-dashboard
				*ngIf="userRole === UserRole.ADMIN"
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

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		this.userRole = this.authService.currentUser?.role || "";
	}
}
