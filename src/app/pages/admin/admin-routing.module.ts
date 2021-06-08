import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminRouteNames, Role } from "src/app/models/enums";
import { AdminDashboardComponent } from "./admin-dashboard/admin-dashboard.component";
import { DataComponent } from "./admin-dashboard/data/data.component";
import { ManageGuestsComponent } from "./admin-dashboard/manage-guests/manage-guests.component";
import { CreateModifyStudyComponent } from "./admin-dashboard/studies/create-modify-study/create-modify-study.component";
import { StudiesComponent } from "./admin-dashboard/studies/studies.component";
import { ViewStudiesComponent } from "./admin-dashboard/studies/view-studies/view-studies.component";
import { StudyComponentsComponent } from "./admin-dashboard/study-components/study-components.component";

const routes: Routes = [
    {
        path: AdminRouteNames.DASHBOARD_BASEROUTE,
        component: AdminDashboardComponent,
        data: { roles: [Role.ADMIN, Role.GUEST] },
        children: [
            { path: "", redirectTo: AdminRouteNames.STUDIES_SUBROUTE, pathMatch: "full" },
            {
                path: AdminRouteNames.STUDIES_SUBROUTE,
                component: StudiesComponent,
                children: [
                    { path: "", component: ViewStudiesComponent },
                    { path: AdminRouteNames.STUDIES_CREATE_SUBROUTE, component: CreateModifyStudyComponent },
                    { path: ":id", component: DataComponent },
                ],
            },
            { path: AdminRouteNames.COMPONENTS_SUBROUTE, component: StudyComponentsComponent },
            { path: AdminRouteNames.GUESTS_SUBROUTE, component: ManageGuestsComponent },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
