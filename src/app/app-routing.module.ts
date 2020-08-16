import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { ColorGameComponent } from './pages/experiments/color-game/color-game.component';
import { ShapeGameComponent } from './pages/experiments/shape-game/shape-game.component';
import { GoNogoComponent } from './pages/experiments/go-nogo/go-nogo.component';
import { DigitSpanComponent } from './pages/experiments/digit-span/digit-span.component';
import { TaskSwitchingComponent } from './pages/experiments/task-switching/task-switching.component';
import { DemandSelectionComponent } from './pages/experiments/demand-selection/demand-selection.component';
import { SimonTaskPrelimComponent } from './pages/experiments/simon-task-prelim/simon-task-prelim.component';
import { SimonTaskFinalComponent } from './pages/experiments/simon-task-final/simon-task-final.component';
import { SmileyFaceComponent } from './pages/experiments/smiley-face/smiley-face.component';
import { FingerTappingTaskComponent } from './pages/experiments/finger-tapping-task/finger-tapping-task.component';
import { NBackComponent } from './pages/experiments/n-back/n-back.component';
import { StroopTaskComponent } from './pages/experiments/stroop-task/stroop-task.component';
import { TrailMakingComponent } from './pages/experiments/trail-making/trail-making.component';
import { ViewExperimentsComponent } from './pages/dashboard/view-experiments/view-experiments.component';
import { ViewTasksComponent } from './pages/dashboard/view-tasks/view-tasks.component';
import { MturkLoginComponent } from './pages/mturk-login/mturk-login.component'

const routes: Routes = [
  { path: '', redirectTo: '/dashboard/experiments', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'experiments', pathMatch: 'full' },
      { path: 'experiments', component: ViewExperimentsComponent },
      { path: 'tasks', component: ViewTasksComponent }
    ] 
  },
  { path: 'login', component: MturkLoginComponent },
  { path: 'experiments/color-game', component: ColorGameComponent },
  { path: 'experiments/shape-game', component: ShapeGameComponent },
  { path: 'experiments/go-nogo', component: GoNogoComponent },
  { path: 'experiments/digit-span', component: DigitSpanComponent },
  { path: 'experiments/ts', component: TaskSwitchingComponent },
  { path: 'experiments/dst', component: DemandSelectionComponent },
  { path: 'experiments/simon-1', component: SimonTaskPrelimComponent },
  { path: 'experiments/simon-2', component: SimonTaskFinalComponent },
  { path: 'experiments/smiley-face', component: SmileyFaceComponent },
  { path: 'experiments/ftt', component: FingerTappingTaskComponent },
  { path: 'experiments/n-back', component: NBackComponent },
  { path: 'experiments/stroop', component: StroopTaskComponent },
  { path: 'experiments/trail-making', component: TrailMakingComponent },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
