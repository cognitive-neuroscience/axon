import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationMemberDashboardComponent } from './organization-member-dashboard/organization-member-dashboard.component';
import { RouterModule } from '@angular/router';
import { OrganizationMemberRoutingModule } from './organization-member-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        OrganizationMemberDashboardComponent,
        // StudiesComponent,
        // StudyComponentsComponent,
        // ViewStudiesComponent,
        // CreateModifyStudyComponent,
        // DataComponent,
    ],
    imports: [CommonModule, RouterModule, OrganizationMemberRoutingModule, TranslateModule, SharedModule],
})
export class OrganizationMemberModule {}
