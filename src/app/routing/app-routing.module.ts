import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { LoginComponent } from '../pages/login/login.component';
import { ColorGameComponent } from '../pages/tasks/color-game/color-game.component';
import { ShapeGameComponent } from '../pages/tasks/shape-game/shape-game.component';
import { OddballComponent } from '../pages/tasks/oddball/oddball.component';
import { DigitSpanComponent } from '../pages/tasks/digit-span/digit-span.component';
import { TaskSwitchingComponent } from '../pages/tasks/task-switching/task-switching.component';
import { DemandSelectionComponent } from '../pages/tasks/demand-selection/demand-selection.component';
import { SimonTaskPrelimComponent } from '../pages/tasks/simon-task-prelim/simon-task-prelim.component';
import { SimonTaskFinalComponent } from '../pages/tasks/simon-task-final/simon-task-final.component';
import { SmileyFaceComponent } from '../pages/tasks/smiley-face/smiley-face.component';
import { FingerTappingTaskComponent } from '../pages/tasks/finger-tapping/finger-tapping-task.component';
import { NBackComponent } from '../pages/tasks/n-back/n-back.component';
import { StroopTaskComponent } from '../pages/tasks/stroop/stroop-task.component';
import { TrailMakingComponent } from '../pages/tasks/trail-making/trail-making.component';
import { RatingComponent } from '../pages/tasks/rating/rating.component';
import { ChoiceComponent } from '../pages/tasks/choice/choice.component';
import { PostChoiceComponent } from '../pages/tasks/post-choice/post-choice.component';
import { ViewStudiesComponent } from '../pages/dashboard/view-studies/view-studies.component';
import { CrowdSourceLoginComponent } from '../pages/participant/crowdsource-login/crowdsource-login.component'
import { Role } from '../models/InternalDTOs';
import { RouteMap } from './routes';
import { CanActivateRouteGuard } from '../guards/CanActivateRouteGuard';
import { FinalPageComponent } from '../pages/participant/final-page/final-page.component';
import { ExperimentRouteGuard } from '../guards/ExperimentRouteGuard';
import { DataComponent } from '../pages/dashboard/data/data.component';
import { ConsentComponent } from '../pages/questionnaires/consent/consent.component';
import { DemographicsQuestionnaireComponent } from '../pages/questionnaires/demographics-questionnaire/demographics-questionnaire.component';
import { FeedbackQuestionnaireComponent } from '../pages/questionnaires/feedback-questionnaire/feedback-questionnaire.component';
import { StarksteinApathyScaleComponent } from '../pages/questionnaires/starkstein-apathy-scale/starkstein-apathy-scale.component';
import { ManageGuestsComponent } from '../pages/dashboard/manage-guests/manage-guests.component';
import { QuestionnaireComponent } from '../pages/questionnaires/questionnaire/questionnaire.component';
import { StudyComponentsComponent } from '../pages/dashboard/study-components/study-components.component';

const routes: Routes = [
  { path: '', redirectTo: 'login/onlineparticipant', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    data: { roles: [Role.ADMIN, Role.GUEST] },
    canActivate: [CanActivateRouteGuard],
    children: [
      { path: '', redirectTo: 'experiments', pathMatch: 'full' },
      { path: 'experiments', component: ViewStudiesComponent },
      { path: 'components', component: StudyComponentsComponent },
      { path: 'data', component: DataComponent },
      { path: 'guests', component: ManageGuestsComponent }
    ]
  },
  { path: 'login/onlineparticipant', component: CrowdSourceLoginComponent },
  { path: RouteMap.demographicsquestionnaire.route , component: DemographicsQuestionnaireComponent },
  { path: 'questionnaire/feedback', component: FeedbackQuestionnaireComponent },
  { path: 'questionnaire/apathy', component: StarksteinApathyScaleComponent},
  { path: 'login', component: LoginComponent },
  { path: RouteMap.consent.route, component: ConsentComponent },
  { path: RouteMap.colorgame.route, component: ColorGameComponent },
  { path: RouteMap.shapegame.route, component: ShapeGameComponent },
  { path: RouteMap.oddball.route, component: OddballComponent },
  { path: RouteMap.digitspan.route, component: DigitSpanComponent },
  { path: RouteMap.taskswitching.route, component: TaskSwitchingComponent, canActivate: [ExperimentRouteGuard] },
  { path: RouteMap.demandselection.route, component: DemandSelectionComponent, canActivate: [ExperimentRouteGuard] },
  { path: RouteMap.simon.route, component: SimonTaskPrelimComponent },
  { path: 'experiments/simon-2', component: SimonTaskFinalComponent },
  { path: RouteMap.smileyface.route, component: SmileyFaceComponent },
  { path: RouteMap.fingertapping.route, component: FingerTappingTaskComponent, canActivate: [ExperimentRouteGuard] },
  { path: RouteMap.nback.route, component: NBackComponent, canActivate: [ExperimentRouteGuard] },
  { path: RouteMap.stroop.route, component: StroopTaskComponent, canActivate: [ExperimentRouteGuard], data: { trials: 120 } },
  { path: RouteMap.stroopshort.route, redirectTo: RouteMap.stroop.route, canActivate: [ExperimentRouteGuard], data: { trials: 60 } },
  { path: RouteMap.trailmaking.route, component: TrailMakingComponent, canActivate: [ExperimentRouteGuard] },
  { path: RouteMap.rating.route, component: RatingComponent },
  { path: RouteMap.choice.route, component: ChoiceComponent },
  { path: RouteMap.postchoice.route, component: PostChoiceComponent },
  { path: 'complete', component: FinalPageComponent, canActivate: [ExperimentRouteGuard] },
  { path: RouteMap.surveymonkeyquestionnaire.route, component: QuestionnaireComponent },
  { path: '**', redirectTo: '/login/onlineparticipant', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
