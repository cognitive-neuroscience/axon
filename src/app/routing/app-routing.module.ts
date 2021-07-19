import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "../pages/landing-page/login/login.component";
import { FinalPageComponent } from "../pages/participant/final-page/final-page.component";
import { LandingPageComponent } from "../pages/landing-page/landing-page.component";
import { RegisterComponent } from "../pages/landing-page/register/register.component";
import { ParticipantRouteNames, RouteNames } from "../models/enums";
import { CrowdSourceLoginComponent } from "../pages/landing-page/crowdsource-login/crowdsource-login.component";
import { TaskPlayerComponent } from "../pages/tasks/playables/task-player/task-player.component";
import { QuestionnaireReaderComponent } from "../pages/tasks/questionnaire-reader/questionnaire-reader.component";
import { FeedbackQuestionnaireComponent } from "../pages/participant/final-page/feedback-questionnaire/feedback-questionnaire.component";
import { PavloviaTasksComponent } from "../pages/admin/admin-dashboard/study-components/pavlovia-tasks/pavlovia-tasks.component";
import { EmbeddedPageComponent } from "../pages/tasks/embedded-page/embedded-page.component";
import { ConsentPageComponent } from "../pages/tasks/consent/consent-page/consent-page.component";

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
        path: RouteNames.CONSENT,
        component: ConsentPageComponent,
    },
    {
        path: RouteNames.TASKPLAYER,
        component: TaskPlayerComponent,
    },
    {
        path: RouteNames.PAVLOVIA,
        component: EmbeddedPageComponent,
    },
    {
        path: RouteNames.QUESTIONNAIRE,
        component: QuestionnaireReaderComponent,
    },
    { path: "complete", component: FinalPageComponent },
    // { path: "*", component: NotFoundCompo } TODO
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            useHash: true,
            relativeLinkResolution: "legacy",
            scrollPositionRestoration: "enabled",
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
