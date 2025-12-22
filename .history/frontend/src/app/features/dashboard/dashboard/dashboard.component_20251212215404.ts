import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="page-container">
      <app-user-dashboard *ngIf="userRole === 'user'"></app-user-dashboard>
      <app-staff-dashboard *ngIf="userRole === 'staff'"></app-staff-dashboard>
      <app-admin-dashboard *ngIf="userRole === 'admin'"></app-admin-dashboard>
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
  userRole: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.currentUser?.role || '';
  }
}
