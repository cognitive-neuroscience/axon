import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "../pages/landing-page/login/login.component";
import { FinalPageComponent } from "../pages/participant/final-page/final-page.component";
import { LandingPageComponent } from "../pages/landing-page/landing-page.component";
import { RegisterComponent } from "../pages/landing-page/register/register.component";
import { ParticipantRouteNames, RouteNames } from "../models/enums";
import { CrowdSourceLoginComponent } from "../pages/landing-page/crowdsource-login/crowdsource-login.component";
import { TaskPlayerComponent } from "../pages/tasks/playables/task-player/task-player.component";
import { QuestionnaireReaderComponent } from "../pages/tasks/questionnaires/questionnaire-reader/questionnaire-reader.component";

const routes: Routes = [
    {
        path: "",
        component: LandingPageComponent,
        children: [
            { path: "", redirectTo: RouteNames.LANDINGPAGE_LOGIN_SUBROUTE, pathMatch: "full" },
            { path: RouteNames.LANDINGPAGE_LOGIN_SUBROUTE, component: LoginComponent },
            { path: RouteNames.LANDINGPAGE_REGISTER_SUBROUTE, component: RegisterComponent },
        ],
    },
    {
        path: ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE,
        component: CrowdSourceLoginComponent,
    },
    {
        path: RouteNames.TASKPLAYER,
        component: TaskPlayerComponent,
    },
    {
        path: RouteNames.QUESTIONNAIRE,
        component: QuestionnaireReaderComponent,
    },
    { path: "complete", component: FinalPageComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: "legacy" })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
