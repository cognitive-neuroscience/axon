import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ColorGameComponent } from './pages/experiments/color-game/color-game.component';
import { ShapeGameComponent } from './pages/experiments/shape-game/shape-game.component';
import { SmileyGameComponent } from './pages/experiments/smiley-game/smiley-game.component';
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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    ColorGameComponent,
    ShapeGameComponent,
    SmileyGameComponent,
    GoNogoComponent,
    DigitSpanComponent,
    DemandSelectionComponent,
    TaskSwitchingComponent,
    SimonTaskPrelimComponent,
    SimonTaskFinalComponent,
    QuestionnaireComponent,
    ConsentComponent
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
