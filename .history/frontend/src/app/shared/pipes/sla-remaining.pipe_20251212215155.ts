import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'slaRemaining',
})
export class SlaRemainingPipe implements PipeTransform {
  transform(deadline: string, isOverdue = false): string {
    if (!deadline) return '';

    if (isOverdue) {
      return 'Overdue';
    }

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Overdue';
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (remainingHours > 0) {
        return `${days}d ${remainingHours}h`;
      }
      return `${days}d`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }
}
