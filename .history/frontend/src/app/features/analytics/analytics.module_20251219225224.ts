import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { NgApexchartsModule } from "ng-apexcharts";
import { SharedModule } from "@shared/shared.module";
import { AnalyticsDashboardComponent } from "./analytics-dashboard/analytics-dashboard.component";
import { AuthGuard } from "@core/guards/auth.guard";
import { RoleGuard } from "@core/guards/role.guard";

const routes: Routes = [
	{
		path: "",
		component: AnalyticsDashboardComponent,
		canActivate: [AuthGuard, RoleGuard],
		data: { roles: ["Admin"] },
	},
];

@NgModule({
	declarations: [AnalyticsDashboardComponent],
	imports: [
		CommonModule,
		SharedModule,
		NgApexchartsModule,
		RouterModule.forChild(routes),
	],
})
export class AnalyticsModule {}
