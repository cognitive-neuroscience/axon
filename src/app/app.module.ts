import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './routing/app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ColorGameComponent } from './pages/tasks/color-game/color-game.component';
import { ShapeGameComponent } from './pages/tasks/shape-game/shape-game.component';
import { GoNogoComponent } from './pages/tasks/go-nogo/go-nogo.component';
import { DigitSpanComponent } from './pages/tasks/digit-span/digit-span.component';
import { DemandSelectionComponent } from './pages/tasks/demand-selection/demand-selection.component';
import { TaskSwitchingComponent } from './pages/tasks/task-switching/task-switching.component';
import { SimonTaskPrelimComponent } from './pages/tasks/simon-task-prelim/simon-task-prelim.component';
import { SimonTaskFinalComponent } from './pages/tasks/simon-task-final/simon-task-final.component';
import { ConsentComponent } from './services/consent/consent.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './modules/material/material.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JWTInterceptor } from './JWTInterceptor';
import { FingerTappingTaskComponent } from './pages/tasks/finger-tapping/finger-tapping-task.component';
import { NBackComponent } from './pages/tasks/n-back/n-back.component';
import { StroopTaskComponent } from './pages/tasks/stroop/stroop-task.component';
import { SmileyFaceComponent } from './pages/tasks/smiley-face/smiley-face.component';
import { TrailMakingComponent } from './pages/tasks/trail-making/trail-making.component';
import { ViewTasksComponent } from './pages/dashboard/view-tasks/view-tasks.component';
import { ViewExperimentsComponent } from './pages/dashboard/view-experiments/view-experiments.component';
import { NavbarComponent } from './pages/dashboard/navbar/navbar.component';
import { CreateExperimentDialogComponent } from './pages/dashboard/view-experiments/create-experiment-dialog/create-experiment-dialog.component';
import { MturkLoginComponent } from './pages/mturk-login/mturk-login.component';
import { SnackbarComponent } from './services/snackbar/snackbar.component';
import { ConfirmationComponent } from './services/confirmation/confirmation.component';
import { FinalPageComponent } from './pages/participant/final-page/final-page.component';
import { DataComponent } from './pages/dashboard/data/data.component';
import { DemographicsQuestionnaireComponent } from './pages/questionnaires/demographics-questionnaire/demographics-questionnaire.component';
import { RotateDirective } from './pages/tasks/demand-selection/Rotate.directive';
import { FeedbackQuestionnaireComponent } from './pages/questionnaires/feedback-questionnaire/feedback-questionnaire.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    ColorGameComponent,
    ShapeGameComponent,
    GoNogoComponent,
    DigitSpanComponent,
    DemandSelectionComponent,
    TaskSwitchingComponent,
    SimonTaskPrelimComponent,
    SimonTaskFinalComponent,
    ConsentComponent,
    FingerTappingTaskComponent,
    NBackComponent,
    StroopTaskComponent,
    SmileyFaceComponent,
    TrailMakingComponent,
    ViewTasksComponent,
    ViewExperimentsComponent,
    NavbarComponent,
    CreateExperimentDialogComponent,
    MturkLoginComponent,
    SnackbarComponent,
    ConfirmationComponent,
    FinalPageComponent,
    DataComponent,
    DemographicsQuestionnaireComponent,
    RotateDirective,
    FeedbackQuestionnaireComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JWTInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
