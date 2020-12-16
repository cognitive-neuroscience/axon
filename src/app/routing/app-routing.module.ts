import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { LoginComponent } from '../pages/login/login.component';
import { ColorGameComponent } from '../pages/tasks/color-game/color-game.component';
import { ShapeGameComponent } from '../pages/tasks/shape-game/shape-game.component';
import { GoNogoComponent } from '../pages/tasks/go-nogo/go-nogo.component';
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
import { ViewExperimentsComponent } from '../pages/dashboard/view-experiments/view-experiments.component';
import { ViewTasksComponent } from '../pages/dashboard/view-tasks/view-tasks.component';
import { MturkLoginComponent } from '../pages/mturk-login/mturk-login.component'
import { Role } from '../models/InternalDTOs';
import { RouteMap } from './routes';
import { CanActivateRouteGuard } from '../guards/CanActivateRouteGuard';
import { FinalPageComponent } from '../pages/participant/final-page/final-page.component';
import { ExperimentRouteGuard } from '../guards/ExperimentRouteGuard';
import { DataComponent } from '../pages/dashboard/data/data.component';
import { ConsentComponent } from '../services/consent/consent.component';
import { DemographicsQuestionnaireComponent } from '../pages/questionnaires/demographics-questionnaire/demographics-questionnaire.component';
import { FeedbackQuestionnaireComponent } from '../pages/questionnaires/feedback-questionnaire/feedback-questionnaire.component';

const routes: Routes = [
  { path: '', redirectTo: 'login/mturk', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    data: { roles: [Role.ADMIN] },
    canActivate: [CanActivateRouteGuard],
    children: [
      { path: '', redirectTo: 'experiments', pathMatch: 'full' },
      { path: 'experiments', component: ViewExperimentsComponent },
      { path: 'tasks', component: ViewTasksComponent },
      { path: 'data', component: DataComponent }
    ]
  },
  { path: 'login/mturk', component: MturkLoginComponent },
  { path: 'questionnaire/demographics', component: DemographicsQuestionnaireComponent },
  { path: 'questionnaire/feedback', component: FeedbackQuestionnaireComponent },
  { path: 'login', component: LoginComponent },
  { path: 'consent', component: ConsentComponent },
  { path: RouteMap.colorgame.route, component: ColorGameComponent },
  { path: RouteMap.shapegame.route, component: ShapeGameComponent },
  { path: RouteMap.gonogo.route, component: GoNogoComponent },
  { path: RouteMap.digitspan.route, component: DigitSpanComponent },
  { path: RouteMap.taskswitching.route, component: TaskSwitchingComponent },
  { path: RouteMap.demandselection.route, component: DemandSelectionComponent },
  { path: RouteMap.simon.route, component: SimonTaskPrelimComponent },
  { path: 'experiments/simon-2', component: SimonTaskFinalComponent },
  { path: RouteMap.smileyface.route, component: SmileyFaceComponent },
  { path: RouteMap.fingertapping.route, component: FingerTappingTaskComponent },
  { path: RouteMap.nback.route, component: NBackComponent, canActivate: [ExperimentRouteGuard] },
  { path: RouteMap.stroop.route, component: StroopTaskComponent, canActivate: [ExperimentRouteGuard] },
  { path: RouteMap.trailmaking.route, component: TrailMakingComponent },
  { path: 'complete', component: FinalPageComponent, canActivate: [ExperimentRouteGuard] },
  { path: '**', redirectTo: '/login/mturk', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
