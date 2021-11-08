import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminRoutingModule } from './admin-routing.module';
import { DataComponent } from './admin-dashboard/data/data.component';
import { ManageGuestsComponent } from './admin-dashboard/manage-guests/manage-guests.component';
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
        PavloviaTasksComponent,
        ManageQuestionnairesComponent,
        DataTableComponent,
        ViewInfoDisplaysComponent,
        ViewComponentsTableComponent,
        ViewConsentsComponent,
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
