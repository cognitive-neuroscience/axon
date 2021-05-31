import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "../pages/dashboard/dashboard.component";
import { LoginComponent } from "../pages/login/login.component";
import { ColorGameComponent } from "../pages/tasks/color-game/color-game.component";
import { ShapeGameComponent } from "../pages/tasks/shape-game/shape-game.component";
import { OddballComponent } from "../pages/tasks/oddball/oddball.component";
import { DigitSpanComponent } from "../pages/tasks/digit-span/digit-span.component";
import { TaskSwitchingComponent } from "../pages/tasks/task-switching/task-switching.component";
import { DemandSelectionComponent } from "../pages/tasks/demand-selection/demand-selection.component";
import { SimonTaskPrelimComponent } from "../pages/tasks/simon-task-prelim/simon-task-prelim.component";
import { SimonTaskFinalComponent } from "../pages/tasks/simon-task-final/simon-task-final.component";
import { SmileyFaceComponent } from "../pages/tasks/smiley-face/smiley-face.component";
import { FingerTappingTaskComponent } from "../pages/tasks/finger-tapping/finger-tapping-task.component";
import { NBackComponent } from "../pages/tasks/n-back/n-back.component";
import { StroopTaskComponent } from "../pages/tasks/stroop/stroop-task.component";
import { TrailMakingComponent } from "../pages/tasks/trail-making/trail-making.component";
import { RatingComponent } from "../pages/tasks/rating/rating.component";
import { ChoiceComponent } from "../pages/tasks/choice/choice.component";
import { PostChoiceComponent } from "../pages/tasks/post-choice/post-choice.component";
import { ViewStudiesComponent } from "../pages/dashboard/view-studies/view-studies.component";
import { CrowdSourceLoginComponent } from "../pages/participant/crowdsource-login/crowdsource-login.component";
import { Role } from "../models/InternalDTOs";
import { RouteMap } from "./routes";
import { CanActivateRouteGuard } from "../guards/CanActivateRouteGuard";
import { FinalPageComponent } from "../pages/participant/final-page/final-page.component";
import { ExperimentRouteGuard } from "../guards/ExperimentRouteGuard";
import { DataComponent } from "../pages/dashboard/data/data.component";
import { ConsentComponent } from "../pages/questionnaires/consent/consent.component";
import { DemographicsQuestionnaireComponent } from "../pages/questionnaires/demographics-questionnaire/demographics-questionnaire.component";
import { FeedbackQuestionnaireComponent } from "../pages/questionnaires/feedback-questionnaire/feedback-questionnaire.component";
import { ManageGuestsComponent } from "../pages/dashboard/manage-guests/manage-guests.component";
import { EmbeddedPageComponent } from "../pages/questionnaires/embedded-page/embedded-page.component";
import { StudyComponentsComponent } from "../pages/dashboard/study-components/study-components.component";
import { environment } from "src/environments/environment";
import { DisplayComponent } from "../pages/tasks/shared/display/display.component";
import { RatingNewComponent } from "../pages/tasks/rating-new/rating-new.component";

const routes: Routes = [
    { path: "", redirectTo: "login/onlineparticipant", pathMatch: "full" },
    {
        path: "dashboard",
        component: DashboardComponent,
        data: { roles: [Role.ADMIN, Role.GUEST] },
        canActivate: [CanActivateRouteGuard],
        children: [
            { path: "", redirectTo: "experiments", pathMatch: "full" },
            { path: "experiments", component: ViewStudiesComponent },
            { path: "components", component: StudyComponentsComponent },
            { path: "data", component: DataComponent },
            { path: "guests", component: ManageGuestsComponent },
        ],
    },
    { path: "login/onlineparticipant", component: CrowdSourceLoginComponent },
    {
        path: RouteMap.demographicsquestionnaire.route,
        component: DemographicsQuestionnaireComponent,
        canActivate: [ExperimentRouteGuard],
    },
    { path: "questionnaire/feedback", component: FeedbackQuestionnaireComponent },
    { path: "login", component: LoginComponent },
    { path: RouteMap.consent.route, component: ConsentComponent /*canActivate: [ExperimentRouteGuard]*/ },
    { path: RouteMap.colorgame.route, component: ColorGameComponent },
    { path: RouteMap.shapegame.route, component: ShapeGameComponent },
    { path: RouteMap.oddball.route, component: OddballComponent, canActivate: [ExperimentRouteGuard] },
    { path: RouteMap.digitspan.route, component: DigitSpanComponent, canActivate: [ExperimentRouteGuard] },
    { path: RouteMap.taskswitching.route, component: TaskSwitchingComponent, canActivate: [ExperimentRouteGuard] },
    { path: RouteMap.demandselection.route, component: DemandSelectionComponent, canActivate: [ExperimentRouteGuard] },
    { path: RouteMap.simon.route, component: SimonTaskPrelimComponent },
    { path: "experiments/simon-2", component: SimonTaskFinalComponent },
    { path: RouteMap.smileyface.route, component: SmileyFaceComponent, canActivate: [ExperimentRouteGuard] },
    { path: RouteMap.fingertapping.route, component: FingerTappingTaskComponent, canActivate: [ExperimentRouteGuard] },
    { path: RouteMap.nback.route, component: NBackComponent, canActivate: [ExperimentRouteGuard] },
    {
        path: RouteMap.stroop.route,
        component: StroopTaskComponent,
        canActivate: [ExperimentRouteGuard],
        data: { trials: environment.production ? 120 : 10 },
    },
    {
        path: RouteMap.stroopshort.route,
        component: StroopTaskComponent,
        canActivate: [ExperimentRouteGuard],
        data: { trials: environment.production ? 60 : 5 },
    },
    { path: RouteMap.trailmaking.route, component: TrailMakingComponent, canActivate: [ExperimentRouteGuard] },
    { path: RouteMap.rating.route, component: RatingComponent, canActivate: [ExperimentRouteGuard] },
    { path: RouteMap.choice.route, component: ChoiceComponent, canActivate: [ExperimentRouteGuard] },
    { path: RouteMap.postchoice.route, component: PostChoiceComponent, canActivate: [ExperimentRouteGuard] },
    { path: RouteMap.ratingnew.route, component: RatingNewComponent, canActivate: [ExperimentRouteGuard] },
    {
        path: RouteMap.surveymonkeyquestionnaire.route,
        component: EmbeddedPageComponent,
        canActivate: [ExperimentRouteGuard],
    },
    { path: "complete", component: FinalPageComponent },
    { path: "**", redirectTo: "/login/onlineparticipant", pathMatch: "full" },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: "legacy" })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
