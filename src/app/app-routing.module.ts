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
import { SmileyGameComponent } from './pages/experiments/smiley-game/smiley-game.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'experiments/color-game',
    component: ColorGameComponent
  },
  {
    path: 'experiments/shape-game',
    component: ShapeGameComponent
  },
  {
    path: 'experiments/go-nogo',
    component: GoNogoComponent
  },
  {
    path: 'experiments/digit-span',
    component: DigitSpanComponent
  },
  {
    path: 'experiments/ts',
    component: TaskSwitchingComponent
  },
  {
    path: 'experiments/dst',
    component: DemandSelectionComponent
  },
  {
    path: 'experiments/simon-1',
    component: SimonTaskPrelimComponent
  },
  {
    path: 'experiments/simon-2',
    component: SimonTaskFinalComponent
  },
  {
    path: 'experiments/smiley-face',
    component: SmileyGameComponent
  },
  {
    path: '**',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
