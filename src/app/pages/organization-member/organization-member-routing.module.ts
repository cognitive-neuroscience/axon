import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanActivateRouteGuard } from 'src/app/guards/CanActivateRouteGuard';
import { Role } from 'src/app/models/enums';
import { DataComponent } from '../admin/admin-dashboard/data/data.component';
import { CreateModifyStudyComponent } from '../admin/admin-dashboard/studies/create-modify-study/create-modify-study.component';
import { StudiesComponent } from '../admin/admin-dashboard/studies/studies.component';
import { ViewStudiesComponent } from '../admin/admin-dashboard/studies/view-studies/view-studies.component';
import { StudyComponentsComponent } from '../admin/admin-dashboard/study-components/study-components.component';
import { OrganizationMemberDashboardComponent } from './organization-member-dashboard/organization-member-dashboard.component';

const routes: Routes = [
    {
        path: 'organization-member-dashboard',
        component: OrganizationMemberDashboardComponent,
        canActivate: [CanActivateRouteGuard],
        data: { roles: [Role.ORGANIZATION_MEMBER, Role.GUEST] },
        children: [
            { path: '', redirectTo: 'studies', pathMatch: 'full' },
            {
                path: 'studies',
                component: StudiesComponent,
                children: [
                    { path: '', component: ViewStudiesComponent },
                    { path: 'create', component: CreateModifyStudyComponent },
                    { path: ':id', component: DataComponent },
                ],
            },
            { path: 'components', component: StudyComponentsComponent },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrganizationMemberRoutingModule {}
