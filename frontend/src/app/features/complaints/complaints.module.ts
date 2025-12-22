import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "@shared/shared.module";

import { ComplaintListComponent } from "./complaint-list/complaint-list.component";
import { ComplaintDetailComponent } from "./complaint-detail/complaint-detail.component";
import { ComplaintFormComponent } from "./complaint-form/complaint-form.component";
import { ComplaintTimelineComponent } from "./complaint-timeline/complaint-timeline.component";
import { ComplaintCommentsComponent } from "./complaint-comments/complaint-comments.component";
import { ComplaintFeedbackComponent } from "./complaint-feedback/complaint-feedback.component";
import { ComplaintFiltersComponent } from "./complaint-filters/complaint-filters.component";

const routes: Routes = [
	{ path: "", component: ComplaintListComponent },
	{ path: "new", component: ComplaintFormComponent },
	{ path: ":id", component: ComplaintDetailComponent },
	{ path: ":id/edit", component: ComplaintFormComponent },
];

@NgModule({
	declarations: [
		ComplaintListComponent,
		ComplaintDetailComponent,
		ComplaintFormComponent,
		ComplaintTimelineComponent,
		ComplaintCommentsComponent,
		ComplaintFeedbackComponent,
		ComplaintFiltersComponent,
	],
	imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ComplaintsModule {}
