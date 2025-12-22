import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgApexchartsModule } from "ng-apexcharts";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
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
		FormsModule,
		SharedModule,
		NgApexchartsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatIconModule,
		MatButtonModule,
		MatTableModule,
		RouterModule.forChild(routes),
	],
})
export class AnalyticsModule {}
