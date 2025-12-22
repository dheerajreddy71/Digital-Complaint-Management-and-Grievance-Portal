import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "@shared/shared.module";

import { ProfileComponent } from "./profile/profile.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";

const routes: Routes = [
	{ path: "", component: ProfileComponent },
	{ path: "change-password", component: ChangePasswordComponent },
];

@NgModule({
	declarations: [ProfileComponent, ChangePasswordComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		SharedModule,
		RouterModule.forChild(routes),
	],
})
export class ProfileModule {}
