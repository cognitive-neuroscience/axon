import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanActivateRouteGuard } from 'src/app/guards/CanActivateRouteGuard';
import { Role } from 'src/app/models/enums';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DataComponent } from './admin-dashboard/data/data.component';
import { ManageUsersComponent } from './admin-dashboard/manage-users/manage-users.component';
import { CreateModifyStudyComponent } from './admin-dashboard/studies/create-modify-study/create-modify-study.component';
import { StudiesComponent } from './admin-dashboard/studies/studies.component';
import { ViewStudiesComponent } from './admin-dashboard/studies/view-studies/view-studies.component';
import { StudyComponentsComponent } from './admin-dashboard/study-components/study-components.component';

const routes: Routes = [
    {
        path: 'admin-dashboard',
        canActivate: [CanActivateRouteGuard],
        component: AdminDashboardComponent,
        data: { roles: [Role.ADMIN] },
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
            { path: 'users', component: ManageUsersComponent },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
