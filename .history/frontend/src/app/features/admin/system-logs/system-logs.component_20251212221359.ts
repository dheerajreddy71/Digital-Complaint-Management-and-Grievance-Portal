import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AnalyticsService } from '@core/services/analytics.service';
import { AuditLog } from '@core/models';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-system-logs',
  template: `
    <div class="page-container">
      <div class="page-header fade-in">
        <div class="header-left">
          <h1>System Logs</h1>
          <p class="subtitle">Audit trail and system activity logs</p>
        </div>
        <button mat-stroked-button (click)="exportLogs()">
          <mat-icon>download</mat-icon>
          Export Logs
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card fade-in">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search logs</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input
              matInput
              [formControl]="searchControl"
              placeholder="Search by action, user, or details"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Action Type</mat-label>
            <mat-select [(ngModel)]="actionFilter" (selectionChange)="applyFilters()">
              <mat-option value="">All Actions</mat-option>
              <mat-option value="LOGIN">Login</mat-option>
              <mat-option value="LOGOUT">Logout</mat-option>
              <mat-option value="CREATE">Create</mat-option>
              <mat-option value="UPDATE">Update</mat-option>
              <mat-option value="DELETE">Delete</mat-option>
              <mat-option value="STATUS_CHANGE">Status Change</mat-option>
              <mat-option value="ASSIGN">Assign</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Entity Type</mat-label>
            <mat-select [(ngModel)]="entityFilter" (selectionChange)="applyFilters()">
              <mat-option value="">All Entities</mat-option>
              <mat-option value="USER">User</mat-option>
              <mat-option value="COMPLAINT">Complaint</mat-option>
              <mat-option value="COMMENT">Comment</mat-option>
              <mat-option value="FEEDBACK">Feedback</mat-option>
              <mat-option value="SESSION">Session</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date Range</mat-label>
            <mat-select [(ngModel)]="dateFilter" (selectionChange)="loadLogs()">
              <mat-option value="today">Today</mat-option>
              <mat-option value="7d">Last 7 Days</mat-option>
              <mat-option value="30d">Last 30 Days</mat-option>
              <mat-option value="90d">Last 90 Days</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

      <!-- Logs Table -->
      <mat-card class="table-card fade-in" *ngIf="!isLoading">
        <div class="table-container">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="timestamp">
              <th mat-header-cell *matHeaderCellDef>Timestamp</th>
              <td mat-cell *matCellDef="let log">
                <div class="timestamp-cell">
                  <span class="date">{{ log.created_at | date:'shortDate' }}</span>
                  <span class="time">{{ log.created_at | date:'shortTime' }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let log">
                <div class="user-cell">
                  <div class="user-avatar">
                    {{ log.user_name?.charAt(0)?.toUpperCase() || 'S' }}
                  </div>
                  <div class="user-info">
                    <span class="user-name">{{ log.user_name || 'System' }}</span>
                    <span class="user-ip" *ngIf="log.ip_address">{{ log.ip_address }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let log">
                <span class="action-badge" [class]="getActionClass(log.action)">
                  {{ log.action }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="entity">
              <th mat-header-cell *matHeaderCellDef>Entity</th>
              <td mat-cell *matCellDef="let log">
                <div class="entity-cell">
                  <mat-icon>{{ getEntityIcon(log.entity_type) }}</mat-icon>
                  <span>{{ log.entity_type }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="details">
              <th mat-header-cell *matHeaderCellDef>Details</th>
              <td mat-cell *matCellDef="let log">
                <span class="details-text" [matTooltip]="log.details">
                  {{ log.details | truncate:50 }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="expand">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let log">
                <button
                  mat-icon-button
                  (click)="toggleDetails(log); $event.stopPropagation()"
                  *ngIf="log.old_values || log.new_values"
                >
                  <mat-icon>
                    {{ expandedLog === log ? 'expand_less' : 'expand_more' }}
                  </mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns"
              [class.expanded]="expandedLog === row"
              (click)="toggleDetails(row)"
            ></tr>

            <!-- Expanded Detail Row -->
            <ng-container matColumnDef="expandedDetail">
              <td mat-cell *matCellDef="let log" [attr.colspan]="displayedColumns.length">
                <div
                  class="expanded-detail"
                  [@detailExpand]="log === expandedLog ? 'expanded' : 'collapsed'"
                >
                  <div class="detail-content" *ngIf="log === expandedLog">
                    <div class="detail-section" *ngIf="log.old_values">
                      <h4>Previous Values</h4>
                      <pre>{{ log.old_values | json }}</pre>
                    </div>
                    <div class="detail-section" *ngIf="log.new_values">
                      <h4>New Values</h4>
                      <pre>{{ log.new_values | json }}</pre>
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <tr
              mat-row
              *matRowDef="let row; columns: ['expandedDetail']"
              class="detail-row"
            ></tr>
          </table>
        </div>

        <mat-paginator
          [length]="totalLogs"
          [pageSize]="pageSize"
          [pageSizeOptions]="[25, 50, 100]"
          (page)="onPageChange($event)"
          showFirstLastButtons
        ></mat-paginator>
      </mat-card>
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

      .filters-card {
        margin-bottom: 24px;
        padding: 16px;
      }

      .filters-row {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }

      .search-field {
        flex: 1;
        min-width: 250px;
      }

      .table-card {
        overflow: hidden;
      }

      .table-container {
        overflow-x: auto;
      }

      table {
        width: 100%;
      }

      .timestamp-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .timestamp-cell .date {
        font-weight: 500;
      }

      .timestamp-cell .time {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }

      .user-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .user-info {
        display: flex;
        flex-direction: column;
      }

      .user-name {
        font-weight: 500;
      }

      .user-ip {
        font-size: 0.625rem;
        color: var(--text-secondary);
        font-family: monospace;
      }

      .action-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.625rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .action-login,
      .action-logout {
        background-color: rgba(33, 150, 243, 0.15);
        color: #2196f3;
      }

      .action-create {
        background-color: rgba(76, 175, 80, 0.15);
        color: #4caf50;
      }

      .action-update,
      .action-status_change {
        background-color: rgba(255, 152, 0, 0.15);
        color: #ff9800;
      }

      .action-delete {
        background-color: rgba(244, 67, 54, 0.15);
        color: #f44336;
      }

      .action-assign {
        background-color: rgba(156, 39, 176, 0.15);
        color: #9c27b0;
      }

      .entity-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;
      }

      .entity-cell mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--text-secondary);
      }

      .details-text {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      tr.expanded {
        background-color: rgba(var(--primary-rgb), 0.05);
      }

      .detail-row {
        height: 0;
      }

      .expanded-detail {
        overflow: hidden;
      }

      .detail-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        padding: 16px;
        background-color: rgba(0, 0, 0, 0.02);
      }

      :host-context(.dark-theme) .detail-content {
        background-color: rgba(255, 255, 255, 0.05);
      }

      .detail-section h4 {
        margin: 0 0 8px;
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--text-secondary);
      }

      .detail-section pre {
        margin: 0;
        padding: 12px;
        background-color: var(--bg-card);
        border-radius: 4px;
        font-size: 0.75rem;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
      }

      @media (max-width: 768px) {
        .filters-row {
          flex-direction: column;
          align-items: stretch;
        }

        .search-field {
          min-width: 100%;
        }
      }
    `,
  ],
})
export class SystemLogsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<AuditLog>([]);
  displayedColumns = ['timestamp', 'user', 'action', 'entity', 'details', 'expand'];

  searchControl = new FormControl('');
  actionFilter = '';
  entityFilter = '';
  dateFilter = '7d';

  isLoading = true;
  totalLogs = 0;
  pageSize = 25;
  page = 1;

  expandedLog: AuditLog | null = null;

  private entityIcons: Record<string, string> = {
    USER: 'person',
    COMPLAINT: 'description',
    COMMENT: 'comment',
    FEEDBACK: 'star',
    SESSION: 'login',
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadLogs();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.applyFilters();
      });
  }

  loadLogs(): void {
    this.isLoading = true;

    const params: Record<string, string | number> = {
      page: this.page,
      limit: this.pageSize,
      period: this.dateFilter,
    };

    if (this.actionFilter) {
      params['action'] = this.actionFilter;
    }

    if (this.entityFilter) {
      params['entity_type'] = this.entityFilter;
    }

    const searchValue = this.searchControl.value;
    if (searchValue) {
      params['search'] = searchValue;
    }

    this.analyticsService.getAuditLogs(params).subscribe({
      next: (response) => {
        this.dataSource.data = response.logs;
        this.totalLogs = response.total;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadLogs();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }

  getActionClass(action: string): string {
    return 'action-' + action.toLowerCase();
  }

  getEntityIcon(entityType: string): string {
    return this.entityIcons[entityType] || 'folder';
  }

  toggleDetails(log: AuditLog): void {
    if (log.old_values || log.new_values) {
      this.expandedLog = this.expandedLog === log ? null : log;
    }
  }

  exportLogs(): void {
    console.log('Exporting logs...');
  }
}
