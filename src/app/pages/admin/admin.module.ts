import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminDashboardComponent } from "./admin-dashboard/admin-dashboard.component";
import { AdminRoutingModule } from "./admin-routing.module";
import { DataComponent } from "./admin-dashboard/data/data.component";
import { ManageGuestsComponent } from "./admin-dashboard/manage-guests/manage-guests.component";
import { StudiesComponent } from "./admin-dashboard/studies/studies.component";
import { StudyComponentsComponent } from "./admin-dashboard/study-components/study-components.component";
import { ViewTasksComponent } from "./admin-dashboard/study-components/view-tasks/view-tasks.component";
import { MaterialModule } from "src/app/modules/material/material.module";
import { SharedModule } from "../shared/shared.module";
import { RouterModule } from "@angular/router";
import { ManageCustomTasksComponent } from "./admin-dashboard/study-components/manage-custom-tasks/manage-custom-tasks.component";
import { ManageQuestionnairesComponent } from "./admin-dashboard/study-components/manage-questionnaires/manage-questionnaires.component";
import { DataTableComponent } from "./admin-dashboard/data/data-table/data-table.component";
import { ViewStudiesComponent } from "./admin-dashboard/studies/view-studies/view-studies.component";
import { CustomTaskHelpDialogComponent } from "./admin-dashboard/study-components/manage-custom-tasks/custom-task-help-dialog/custom-task-help-dialog.component";
import { CustomTaskPreviewDialogComponent } from "./admin-dashboard/study-components/manage-custom-tasks/custom-task-preview-dialog/custom-task-preview-dialog.component";
import { TaskModule } from "../tasks/task.module";
import { CreateCustomTaskDialogComponent } from "./admin-dashboard/study-components/manage-custom-tasks/create-custom-task-dialog/create-custom-task-dialog.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CreateModifyStudyComponent } from "./admin-dashboard/studies/create-modify-study/create-modify-study.component";

@NgModule({
    declarations: [
        AdminDashboardComponent,
        StudiesComponent,
        ViewStudiesComponent,
        CreateModifyStudyComponent,
        DataComponent,
        ManageGuestsComponent,
        StudyComponentsComponent,
        ViewTasksComponent,
        ManageCustomTasksComponent,
        ManageQuestionnairesComponent,
        DataTableComponent,
        CustomTaskHelpDialogComponent,
        CustomTaskPreviewDialogComponent,
        CreateCustomTaskDialogComponent,
    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        MaterialModule,
        SharedModule,
        RouterModule,
        TaskModule,
        FormsModule,
        ReactiveFormsModule,
    ],
})
export class AdminModule {}
