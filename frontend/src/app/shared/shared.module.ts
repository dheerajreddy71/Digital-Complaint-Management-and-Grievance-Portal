import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

// Angular Material Modules
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatMenuModule } from "@angular/material/menu";
import { MatTabsModule } from "@angular/material/tabs";
import { MatChipsModule } from "@angular/material/chips";
import { MatBadgeModule } from "@angular/material/badge";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDividerModule } from "@angular/material/divider";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatStepperModule } from "@angular/material/stepper";

// Shared Components
import { StatusBadgeComponent } from "./components/status-badge/status-badge.component";
import { PriorityBadgeComponent } from "./components/priority-badge/priority-badge.component";
import { LoadingSpinnerComponent } from "./components/loading-spinner/loading-spinner.component";
import { EmptyStateComponent } from "./components/empty-state/empty-state.component";
import { ConfirmDialogComponent } from "./components/confirm-dialog/confirm-dialog.component";
import { FileUploadComponent } from "./components/file-upload/file-upload.component";
import { SlaIndicatorComponent } from "./components/sla-indicator/sla-indicator.component";
import { StarRatingComponent } from "./components/star-rating/star-rating.component";

// Shared Pipes
import { TimeAgoPipe } from "./pipes/time-ago.pipe";
import { SlaRemainingPipe } from "./pipes/sla-remaining.pipe";
import { CategoryLabelPipe } from "./pipes/category-label.pipe";
import { TruncatePipe } from "./pipes/truncate.pipe";

const MATERIAL_MODULES = [
	MatButtonModule,
	MatIconModule,
	MatToolbarModule,
	MatSidenavModule,
	MatListModule,
	MatCardModule,
	MatFormFieldModule,
	MatInputModule,
	MatSelectModule,
	MatCheckboxModule,
	MatRadioModule,
	MatDatepickerModule,
	MatNativeDateModule,
	MatTableModule,
	MatPaginatorModule,
	MatSortModule,
	MatDialogModule,
	MatSnackBarModule,
	MatProgressSpinnerModule,
	MatProgressBarModule,
	MatMenuModule,
	MatTabsModule,
	MatChipsModule,
	MatBadgeModule,
	MatTooltipModule,
	MatExpansionModule,
	MatDividerModule,
	MatSlideToggleModule,
	MatAutocompleteModule,
	MatStepperModule,
];

const SHARED_COMPONENTS = [
	StatusBadgeComponent,
	PriorityBadgeComponent,
	LoadingSpinnerComponent,
	EmptyStateComponent,
	ConfirmDialogComponent,
	FileUploadComponent,
	SlaIndicatorComponent,
	StarRatingComponent,
];

const SHARED_PIPES = [
	TimeAgoPipe,
	SlaRemainingPipe,
	CategoryLabelPipe,
	TruncatePipe,
];

@NgModule({
	declarations: [...SHARED_COMPONENTS, ...SHARED_PIPES],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,
		...MATERIAL_MODULES,
	],
	exports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,
		...MATERIAL_MODULES,
		...SHARED_COMPONENTS,
		...SHARED_PIPES,
	],
})
export class SharedModule {}
