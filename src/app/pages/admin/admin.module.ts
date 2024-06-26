import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminRoutingModule } from './admin-routing.module';
import { DataComponent } from './admin-dashboard/data/data.component';
import { ManageUsersComponent } from './admin-dashboard/manage-users/manage-users.component';
import { StudiesComponent } from './admin-dashboard/studies/studies.component';
import { StudyComponentsComponent } from './admin-dashboard/study-components/study-components.component';
import { ViewTasksComponent } from './admin-dashboard/study-components/view-tasks/view-tasks.component';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { PavloviaTasksComponent } from './admin-dashboard/study-components/view-pavlovia-tasks/pavlovia-tasks.component';
import { ManageQuestionnairesComponent } from './admin-dashboard/study-components/view-questionnaires/manage-questionnaires.component';
import { DataTableComponent } from './admin-dashboard/data/data-table/data-table.component';
import { ViewStudiesComponent } from './admin-dashboard/studies/view-studies/view-studies.component';
import { TaskModule } from '../tasks/task.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateModifyStudyComponent } from './admin-dashboard/studies/create-modify-study/create-modify-study.component';
import { ViewInfoDisplaysComponent } from './admin-dashboard/study-components/view-info-displays/view-info-displays.component';
import { ViewComponentsTableComponent } from './admin-dashboard/study-components/shared/view-components-table/view-components-table.component';
import { ViewConsentsComponent } from './admin-dashboard/study-components/view-consents/view-consents.component';
import { AlterMetadataDialogComponent } from './admin-dashboard/study-components/view-tasks/alter-metadata-dialog/alter-metadata-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataTreeComponent } from './admin-dashboard/data/data-tree/data-tree.component';

@NgModule({
    declarations: [
        AdminDashboardComponent,
        StudiesComponent,
        ViewStudiesComponent,
        CreateModifyStudyComponent,
        DataComponent,
        ManageUsersComponent,
        StudyComponentsComponent,
        ViewTasksComponent,
        PavloviaTasksComponent,
        ManageQuestionnairesComponent,
        DataTableComponent,
        ViewInfoDisplaysComponent,
        ViewComponentsTableComponent,
        ViewConsentsComponent,
        AlterMetadataDialogComponent,
        DataTreeComponent,
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
        TranslateModule,
    ],
})
export class AdminModule {}
