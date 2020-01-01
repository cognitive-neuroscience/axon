import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ColorGameComponent } from './pages/experiments/color-game/color-game.component';
import { ShapeGameComponent } from './pages/experiments/shape-game/shape-game.component';
import { GoNogoComponent } from './pages/experiments/go-nogo/go-nogo.component';
import { DigitSpanComponent } from './pages/experiments/digit-span/digit-span.component';
import { DemandSelectionComponent } from './pages/experiments/demand-selection/demand-selection.component';
import { TaskSwitchingComponent } from './pages/experiments/task-switching/task-switching.component';
import { SimonTaskPrelimComponent } from './pages/experiments/simon-task-prelim/simon-task-prelim.component';
import { SimonTaskFinalComponent } from './pages/experiments/simon-task-final/simon-task-final.component';
import { QuestionnaireComponent } from './pages/questionnaire/questionnaire.component';
import { ConsentComponent } from './pages/consent/consent.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from './modules/material/material.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppHttpInterceptor } from './AppHttpInterceptor';
import { FingerTappingTaskComponent } from './pages/experiments/finger-tapping-task/finger-tapping-task.component';
import { NBackComponent } from './pages/experiments/n-back/n-back.component';
import { StroopTaskComponent } from './pages/experiments/stroop-task/stroop-task.component';
import { SmileyFaceComponent } from './pages/experiments/smiley-face/smiley-face.component';
import { TrailMakingComponent } from './pages/experiments/trail-making/trail-making.component';

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
    QuestionnaireComponent,
    ConsentComponent,
    FingerTappingTaskComponent,
    NBackComponent,
    StroopTaskComponent,
    SmileyFaceComponent,
    TrailMakingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppHttpInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
