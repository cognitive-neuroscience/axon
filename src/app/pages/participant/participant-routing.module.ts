import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ParticipantRouteNames, Role } from "src/app/models/enums";
import { ParticipantDashboardComponent } from "./participant-dashboard/participant-dashboard.component";
import { ParticipantStudiesComponent } from "./participant-dashboard/participant-studies/participant-studies.component";

const routes: Routes = [
    {
        path: ParticipantRouteNames.DASHBOARD_BASEROUTE,
        component: ParticipantDashboardComponent,
        data: { roles: [Role.PARTICIPANT] },
        children: [
            { path: "", redirectTo: ParticipantRouteNames.STUDIES_SUBROUTE, pathMatch: "full" },
            {
                path: ParticipantRouteNames.STUDIES_SUBROUTE,
                component: ParticipantStudiesComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ParticipantRoutingModule {}
