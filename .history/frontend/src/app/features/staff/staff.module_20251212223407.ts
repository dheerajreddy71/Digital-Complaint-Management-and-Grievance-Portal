import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "@shared/shared.module";

import { StaffQueueComponent } from "./staff-queue/staff-queue.component";
import { AssignedComplaintsComponent } from "./assigned-complaints/assigned-complaints.component";
import { StaffPerformanceComponent } from "./staff-performance/staff-performance.component";

const routes: Routes = [
	{ path: "", redirectTo: "queue", pathMatch: "full" },
	{ path: "queue", component: StaffQueueComponent },
	{ path: "assigned", component: AssignedComplaintsComponent },
	{ path: "performance", component: StaffPerformanceComponent },
];

@NgModule({
	declarations: [
		StaffQueueComponent,
		AssignedComplaintsComponent,
		StaffPerformanceComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		SharedModule,
		RouterModule.forChild(routes),
	],
})
export class StaffModule {}
