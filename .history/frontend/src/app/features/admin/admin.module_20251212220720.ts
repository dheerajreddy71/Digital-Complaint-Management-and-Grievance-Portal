import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { AdminOverviewComponent } from './admin-overview/admin-overview.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { StaffManagementComponent } from './staff-management/staff-management.component';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { SystemLogsComponent } from './system-logs/system-logs.component';

const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: AdminOverviewComponent },
  { path: 'users', component: UserManagementComponent },
  { path: 'staff', component: StaffManagementComponent },
  { path: 'analytics', component: AnalyticsDashboardComponent },
  { path: 'logs', component: SystemLogsComponent },
];

@NgModule({
  declarations: [
    AdminOverviewComponent,
    UserManagementComponent,
    StaffManagementComponent,
    AnalyticsDashboardComponent,
    SystemLogsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class AdminModule {}
