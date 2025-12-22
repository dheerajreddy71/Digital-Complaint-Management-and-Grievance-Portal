import { Pipe, PipeTransform } from "@angular/core";
import { ComplaintCategory } from "@core/models";

@Pipe({
	name: "categoryLabel",
})
export class CategoryLabelPipe implements PipeTransform {
	private readonly labels: Record<ComplaintCategory, string> = {
		[ComplaintCategory.PLUMBING]: "Plumbing",
		[ComplaintCategory.ELECTRICAL]: "Electrical",
		[ComplaintCategory.FACILITY]: "Facility",
		[ComplaintCategory.IT]: "IT",
		[ComplaintCategory.OTHER]: "Other",
	};

	transform(category: ComplaintCategory): string {
		return this.labels[category] || category;
	}
}
