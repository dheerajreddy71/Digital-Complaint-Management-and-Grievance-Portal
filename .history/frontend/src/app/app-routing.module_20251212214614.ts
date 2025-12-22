import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";
import { RoleGuard } from "./core/guards/role.guard";
import { GuestGuard } from "./core/guards/guest.guard";

const routes: Routes = [
	{
		path: "",
		redirectTo: "/dashboard",
		pathMatch: "full",
	},
	{
		path: "auth",
		loadChildren: () =>
			import("./features/auth/auth.module").then((m) => m.AuthModule),
		canActivate: [GuestGuard],
	},
	{
		path: "dashboard",
		loadChildren: () =>
			import("./features/dashboard/dashboard.module").then(
				(m) => m.DashboardModule
			),
		canActivate: [AuthGuard],
	},
	{
		path: "complaints",
		loadChildren: () =>
			import("./features/complaints/complaints.module").then(
				(m) => m.ComplaintsModule
			),
		canActivate: [AuthGuard],
	},
	{
		path: "staff",
		loadChildren: () =>
			import("./features/staff/staff.module").then((m) => m.StaffModule),
		canActivate: [AuthGuard, RoleGuard],
		data: { roles: ["staff", "admin"] },
	},
	{
		path: "admin",
		loadChildren: () =>
			import("./features/admin/admin.module").then((m) => m.AdminModule),
		canActivate: [AuthGuard, RoleGuard],
		data: { roles: ["admin"] },
	},
	{
		path: "notifications",
		loadChildren: () =>
			import("./features/notifications/notifications.module").then(
				(m) => m.NotificationsModule
			),
		canActivate: [AuthGuard],
	},
	{
		path: "profile",
		loadChildren: () =>
			import("./features/profile/profile.module").then((m) => m.ProfileModule),
		canActivate: [AuthGuard],
	},
	{
		path: "**",
		redirectTo: "/dashboard",
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			scrollPositionRestoration: "enabled",
			anchorScrolling: "enabled",
		}),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
