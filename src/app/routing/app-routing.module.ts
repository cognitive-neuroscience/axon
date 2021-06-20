import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "../pages/landing-page/login/login.component";
import { ColorGameComponent } from "../pages/tasks/playables/color-game/color-game.component";
import { ShapeGameComponent } from "../pages/tasks/playables/shape-game/shape-game.component";
// import { OddballComponent } from "../pages/tasks/playables/oddball/oddball.component";
import { DigitSpanComponent } from "../pages/tasks/playables/digit-span/digit-span.component";
import { TaskSwitchingComponent } from "../pages/tasks/playables/task-switching/task-switching.component";
import { DemandSelectionComponent } from "../pages/tasks/playables/demand-selection/demand-selection.component";
import { SmileyFaceComponent } from "../pages/tasks/playables/smiley-face/smiley-face.component";
import { FingerTappingTaskComponent } from "../pages/tasks/playables/finger-tapping/finger-tapping-task.component";
import { NBackComponent } from "../pages/tasks/playables/n-back/n-back.component";
import { TrailMakingComponent } from "../pages/tasks/playables/trail-making/trail-making.component";
import { RatingComponent } from "../pages/tasks/playables/rating/rating.component";
import { ChoiceComponent } from "../pages/tasks/playables/choice/choice.component";
import { PostChoiceComponent } from "../pages/tasks/playables/post-choice/post-choice.component";
import { FinalPageComponent } from "../pages/participant/final-page/final-page.component";
import { StudyRouteGuard } from "../guards/StudyRouteGuard";
import { ConsentComponent } from "../pages/tasks/other/consent/consent.component";
import { DemographicsQuestionnaireComponent } from "../pages/tasks/questionnaires/demographics-questionnaire/demographics-questionnaire.component";
import { EmbeddedPageComponent } from "../pages/tasks/questionnaires/embedded-page/embedded-page.component";
import { environment } from "src/environments/environment";
import { RatingNewComponent } from "../pages/tasks/playables/rating-new/rating-new.component";
import { LandingPageComponent } from "../pages/landing-page/landing-page.component";
import { RegisterComponent } from "../pages/landing-page/register/register.component";
import { ParticipantRouteNames, RouteNames } from "../models/enums";
import { CrowdSourceLoginComponent } from "../pages/landing-page/crowdsource-login/crowdsource-login.component";
import { TempPlayerComponent } from "../pages/tasks/playables/temp-player/temp-player.component";

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
    // {
    //     path: RouteMap.demographicsquestionnaire.route,
    //     component: DemographicsQuestionnaireComponent,
    //     canActivate: [StudyRouteGuard],
    // },
    // { path: RouteMap.consent.route, component: ConsentComponent, canActivate: [StudyRouteGuard] },
    // { path: RouteMap.colorgame.route, component: ColorGameComponent },
    // { path: RouteMap.shapegame.route, component: ShapeGameComponent },
    { path: "tempplayer", component: TempPlayerComponent },
    // { path: RouteMap.digitspan.route, component: DigitSpanComponent, canActivate: [StudyRouteGuard] },
    // { path: RouteMap.taskswitching.route, component: TaskSwitchingComponent, canActivate: [StudyRouteGuard] },
    // { path: RouteMap.demandselection.route, component: DemandSelectionComponent, canActivate: [StudyRouteGuard] },
    // { path: RouteMap.smileyface.route, component: SmileyFaceComponent, canActivate: [StudyRouteGuard] },
    // { path: RouteMap.fingertapping.route, component: FingerTappingTaskComponent, canActivate: [StudyRouteGuard] },
    // { path: RouteMap.nback.route, component: NBackComponent, canActivate: [StudyRouteGuard] },
    // {
    //     path: RouteMap.stroop.route,
    //     component: StroopTaskComponent,
    //     canActivate: [StudyRouteGuard],
    //     data: { trials: environment.production ? 120 : 10 },
    // },
    // {
    //     path: RouteMap.stroopshort.route,
    //     component: StroopTaskComponent,
    //     canActivate: [StudyRouteGuard],
    //     data: { trials: environment.production ? 60 : 5 },
    // },
    // { path: RouteMap.trailmaking.route, component: TrailMakingComponent, canActivate: [StudyRouteGuard] },
    // { path: RouteMap.rating.route, component: RatingComponent, canActivate: [StudyRouteGuard] },
    // { path: RouteMap.choice.route, component: ChoiceComponent, canActivate: [StudyRouteGuard] },
    // { path: RouteMap.postchoice.route, component: PostChoiceComponent, canActivate: [StudyRouteGuard] },
    // { path: RouteMap.ratingnew.route, component: RatingNewComponent, canActivate: [StudyRouteGuard] },
    // {
    //     path: RouteMap.surveymonkeyquestionnaire.route,
    //     component: EmbeddedPageComponent,
    //     canActivate: [StudyRouteGuard],
    // },
    { path: "complete", component: FinalPageComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: "legacy" })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
