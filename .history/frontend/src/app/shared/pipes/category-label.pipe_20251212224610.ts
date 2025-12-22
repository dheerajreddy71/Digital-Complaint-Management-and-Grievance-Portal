import { Pipe, PipeTransform } from "@angular/core";
import { ComplaintCategory } from "@core/models";

@Pipe({
	name: "categoryLabel",
})
export class CategoryLabelPipe implements PipeTransform {
	private readonly labels: Record<ComplaintCategory, string> = {
		[ComplaintCategory.INFRASTRUCTURE]: "Infrastructure",
		[ComplaintCategory.SANITATION]: "Sanitation",
		[ComplaintCategory.UTILITIES]: "Utilities",
		[ComplaintCategory.PUBLIC_SAFETY]: "Public Safety",
		[ComplaintCategory.TRANSPORTATION]: "Transportation",
		[ComplaintCategory.ENVIRONMENT]: "Environment",
		[ComplaintCategory.ADMINISTRATION]: "Administration",
		[ComplaintCategory.OTHER]: "Other"},
	};

	transform(category: ComplaintCategory): string {
		return this.labels[category] || category;
	}
}
