import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { Notification, NotificationType } from '@core/models';

@Component({
  selector: 'app-notification-list',
  template: `
    <div class="page-container">
      <div class="page-header fade-in">
        <div class="header-left">
          <h1>Notifications</h1>
          <p class="subtitle">
            {{ unreadCount > 0 ? unreadCount + ' unread notifications' : 'All caught up!' }}
          </p>
        </div>
        <div class="header-actions" *ngIf="notifications.length > 0">
          <button
            mat-stroked-button
            (click)="markAllAsRead()"
            [disabled]="unreadCount === 0"
          >
            <mat-icon>done_all</mat-icon>
            Mark all as read
          </button>
        </div>
      </div>

      <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

      <div class="notifications-container" *ngIf="!isLoading">
        <app-empty-state
          *ngIf="notifications.length === 0"
          icon="notifications_none"
          title="No notifications"
          message="You don't have any notifications yet"
        ></app-empty-state>

        <mat-card class="notification-card fade-in" *ngIf="notifications.length > 0">
          <div
            class="notification-item"
            *ngFor="let notification of notifications"
            [class.unread]="!notification.is_read"
            (click)="handleNotificationClick(notification)"
          >
            <div class="notification-icon" [class]="getIconClass(notification.type)">
              <mat-icon>{{ getIcon(notification.type) }}</mat-icon>
            </div>

            <div class="notification-content">
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ notification.created_at | timeAgo }}</span>
            </div>

            <div class="notification-actions">
              <button
                mat-icon-button
                *ngIf="!notification.is_read"
                (click)="markAsRead(notification); $event.stopPropagation()"
                matTooltip="Mark as read"
              >
                <mat-icon>check</mat-icon>
              </button>
              <button
                mat-icon-button
                (click)="deleteNotification(notification); $event.stopPropagation()"
                matTooltip="Delete"
              >
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Pagination -->
        <mat-paginator
          *ngIf="totalCount > pageSize"
          [length]="totalCount"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPageChange($event)"
        ></mat-paginator>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .page-header h1 {
        margin: 0 0 4px;
      }

      .subtitle {
        margin: 0;
        color: var(--text-secondary);
      }

      .notification-card {
        overflow: hidden;
      }

      .notification-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px 20px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        border-bottom: 1px solid var(--border-color);
      }

      .notification-item:last-child {
        border-bottom: none;
      }

      .notification-item:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }

      :host-context(.dark-theme) .notification-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }

      .notification-item.unread {
        background-color: rgba(33, 150, 243, 0.05);
      }

      .notification-item.unread:hover {
        background-color: rgba(33, 150, 243, 0.08);
      }

      .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .notification-icon mat-icon {
        color: white;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .notification-icon.status {
        background: linear-gradient(135deg, #2196f3, #1976d2);
      }

      .notification-icon.assignment {
        background: linear-gradient(135deg, #9c27b0, #7b1fa2);
      }

      .notification-icon.comment {
        background: linear-gradient(135deg, #4caf50, #388e3c);
      }

      .notification-icon.reminder {
        background: linear-gradient(135deg, #ff9800, #f57c00);
      }

      .notification-icon.escalation {
        background: linear-gradient(135deg, #f44336, #d32f2f);
      }

      .notification-icon.feedback {
        background: linear-gradient(135deg, #ffc107, #ffa000);
      }

      .notification-icon.resolution {
        background: linear-gradient(135deg, #00bcd4, #0097a7);
      }

      .notification-content {
        flex: 1;
        min-width: 0;
      }

      .notification-message {
        margin: 0 0 4px;
        line-height: 1.4;
      }

      .notification-item.unread .notification-message {
        font-weight: 500;
      }

      .notification-time {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }

      .notification-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .notification-item:hover .notification-actions {
        opacity: 1;
      }

      mat-paginator {
        margin-top: 24px;
        background: transparent;
      }

      @media (max-width: 600px) {
        .notification-actions {
          opacity: 1;
        }

        .notification-item {
          flex-wrap: wrap;
        }

        .notification-actions {
          width: 100%;
          justify-content: flex-end;
          margin-top: 8px;
        }
      }
    `,
  ],
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = true;
  unreadCount = 0;

  page = 1;
  pageSize = 25;
  totalCount = 0;

  private iconMap: Record<NotificationType, string> = {
    [NotificationType.STATUS_UPDATE]: 'update',
    [NotificationType.NEW_ASSIGNMENT]: 'assignment_ind',
    [NotificationType.NEW_COMMENT]: 'comment',
    [NotificationType.SLA_REMINDER]: 'schedule',
    [NotificationType.ESCALATION]: 'priority_high',
    [NotificationType.FEEDBACK_RECEIVED]: 'star',
    [NotificationType.RESOLUTION]: 'check_circle',
  };

  private iconClassMap: Record<NotificationType, string> = {
    [NotificationType.STATUS_UPDATE]: 'status',
    [NotificationType.NEW_ASSIGNMENT]: 'assignment',
    [NotificationType.NEW_COMMENT]: 'comment',
    [NotificationType.SLA_REMINDER]: 'reminder',
    [NotificationType.ESCALATION]: 'escalation',
    [NotificationType.FEEDBACK_RECEIVED]: 'feedback',
    [NotificationType.RESOLUTION]: 'resolution',
  };

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.isLoading = true;

    this.notificationService
      .getNotifications({ page: this.page, limit: this.pageSize })
      .subscribe({
        next: (response) => {
          this.notifications = response.notifications;
          this.totalCount = response.total;
          this.unreadCount = this.notifications.filter((n) => !n.is_read).length;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  getIcon(type: NotificationType): string {
    return this.iconMap[type] || 'notifications';
  }

  getIconClass(type: NotificationType): string {
    return this.iconClassMap[type] || 'status';
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.is_read) {
      this.markAsRead(notification);
    }

    if (notification.complaint_id) {
      this.router.navigate(['/complaints', notification.complaint_id]);
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.is_read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.is_read = true;
        this.unreadCount--;
      },
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.is_read = true));
        this.unreadCount = 0;
        this.snackbar.success('All notifications marked as read');
      },
    });
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((n) => n.id !== notification.id);
        this.totalCount--;
        if (!notification.is_read) {
          this.unreadCount--;
        }
        this.snackbar.success('Notification deleted');
      },
    });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadNotifications();
  }
}
