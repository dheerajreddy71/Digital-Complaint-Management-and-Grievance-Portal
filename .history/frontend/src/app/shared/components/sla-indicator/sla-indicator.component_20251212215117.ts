import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sla-indicator',
  template: `
    <span class="sla-indicator" [ngClass]="slaClass">
      <mat-icon>{{ slaIcon }}</mat-icon>
      <span>{{ slaText }}</span>
    </span>
  `,
  styles: [
    `
      .sla-indicator {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.875rem;
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .sla-ok {
        color: #8bc34a;
      }

      .sla-warning {
        color: #ff9800;
      }

      .sla-overdue {
        color: #f44336;
      }
    `,
  ],
})
export class SlaIndicatorComponent implements OnInit {
  @Input() slaDeadline!: string;
  @Input() isOverdue = false;

  slaClass = '';
  slaIcon = '';
  slaText = '';

  ngOnInit(): void {
    this.calculateSlaStatus();
  }

  private calculateSlaStatus(): void {
    if (this.isOverdue) {
      this.slaClass = 'sla-overdue';
      this.slaIcon = 'error';
      this.slaText = 'Overdue';
      return;
    }

    const deadline = new Date(this.slaDeadline);
    const now = new Date();
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining <= 0) {
      this.slaClass = 'sla-overdue';
      this.slaIcon = 'error';
      this.slaText = 'Overdue';
    } else if (hoursRemaining <= 4) {
      this.slaClass = 'sla-warning';
      this.slaIcon = 'warning';
      this.slaText = this.formatTimeRemaining(hoursRemaining);
    } else {
      this.slaClass = 'sla-ok';
      this.slaIcon = 'schedule';
      this.slaText = this.formatTimeRemaining(hoursRemaining);
    }
  }

  private formatTimeRemaining(hours: number): string {
    if (hours < 1) {
      const minutes = Math.floor(hours * 60);
      return `${minutes}m left`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h left`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
  }
}
