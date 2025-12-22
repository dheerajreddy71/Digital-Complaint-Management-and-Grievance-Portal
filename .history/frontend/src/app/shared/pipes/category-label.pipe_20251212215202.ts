import { Pipe, PipeTransform } from '@angular/core';
import { ComplaintCategory } from '@core/models';

@Pipe({
  name: 'categoryLabel',
})
export class CategoryLabelPipe implements PipeTransform {
  private readonly labels: Record<ComplaintCategory, string> = {
    [ComplaintCategory.BILLING]: 'Billing',
    [ComplaintCategory.TECHNICAL]: 'Technical',
    [ComplaintCategory.SERVICE]: 'Service',
    [ComplaintCategory.GENERAL]: 'General',
  };

  transform(category: ComplaintCategory): string {
    return this.labels[category] || category;
  }
}
