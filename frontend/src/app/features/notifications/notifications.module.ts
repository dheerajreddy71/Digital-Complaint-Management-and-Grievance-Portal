import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "@shared/shared.module";

import { NotificationListComponent } from "./notification-list/notification-list.component";

const routes: Routes = [{ path: "", component: NotificationListComponent }];

@NgModule({
	declarations: [NotificationListComponent],
	imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class NotificationsModule {}
