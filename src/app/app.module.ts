import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./routing/app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./pages/login/login.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { ColorGameComponent } from "./pages/tasks/color-game/color-game.component";
import { ShapeGameComponent } from "./pages/tasks/shape-game/shape-game.component";
import { OddballComponent } from "./pages/tasks/oddball/oddball.component";
import { DigitSpanComponent } from "./pages/tasks/digit-span/digit-span.component";
import { DemandSelectionComponent } from "./pages/tasks/demand-selection/demand-selection.component";
import { TaskSwitchingComponent } from "./pages/tasks/task-switching/task-switching.component";
import { SimonTaskPrelimComponent } from "./pages/tasks/simon-task-prelim/simon-task-prelim.component";
import { SimonTaskFinalComponent } from "./pages/tasks/simon-task-final/simon-task-final.component";
import { ConsentComponent } from "./pages/questionnaires/consent/consent.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "./modules/material/material.module";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { JWTInterceptor } from "./JWTInterceptor";
import { FingerTappingTaskComponent } from "./pages/tasks/finger-tapping/finger-tapping-task.component";
import { NBackComponent } from "./pages/tasks/n-back/n-back.component";
import { StroopTaskComponent } from "./pages/tasks/stroop/stroop-task.component";
import { SmileyFaceComponent } from "./pages/tasks/smiley-face/smiley-face.component";
import { TrailMakingComponent } from "./pages/tasks/trail-making/trail-making.component";
import { ViewTasksComponent } from "./pages/dashboard/study-components/view-tasks/view-tasks.component";
import { ViewStudiesComponent } from "./pages/dashboard/view-studies/view-studies.component";
import { NavbarComponent } from "./pages/dashboard/navbar/navbar.component";
import { CreateStudiesDialogComponent } from "./pages/dashboard/view-studies/create-studies-dialog/create-studies-dialog.component";
import { CrowdSourceLoginComponent } from "./pages/participant/crowdsource-login/crowdsource-login.component";
import { ConfirmationComponent } from "./services/confirmation/confirmation.component";
import { FinalPageComponent } from "./pages/participant/final-page/final-page.component";
import { DataComponent } from "./pages/dashboard/data/data.component";
import { DemographicsQuestionnaireComponent } from "./pages/questionnaires/demographics-questionnaire/demographics-questionnaire.component";
import { RotateDirective } from "./pages/tasks/demand-selection/Rotate.directive";
import { FeedbackQuestionnaireComponent } from "./pages/questionnaires/feedback-questionnaire/feedback-questionnaire.component";
import { DataTableComponent } from "./pages/dashboard/data/data-table/data-table.component";
import { LoaderComponent } from "./services/loader/loader.component";
import { NumpadComponent } from "./pages/tasks/digit-span/numpad/numpad.component";
import { RatingComponent } from "./pages/tasks/rating/rating.component";
import { ChoiceComponent } from "./pages/tasks/choice/choice.component";
import { PostChoiceComponent } from "./pages/tasks/post-choice/post-choice.component";
import { ManageGuestsComponent } from "./pages/dashboard/manage-guests/manage-guests.component";
import { CreateGuestDialogComponent } from "./pages/dashboard/manage-guests/create-guest-dialog/create-guest-dialog.component";
import { EmbeddedPageComponent } from "./pages/questionnaires/embedded-page/embedded-page.component";
import { SafePipe } from "./pipes/safe.pipe";
import { StudyComponentsComponent } from "./pages/dashboard/study-components/study-components.component";
import { ManageQuestionnairesComponent } from "./pages/dashboard/study-components/manage-questionnaires/manage-questionnaires.component";
import { CreateQuestionnaireDialogComponent } from "./pages/dashboard/study-components/manage-questionnaires/create-questionnaire-dialog/create-questionnaire-dialog.component";
import { PreviewQuestionnaireDialogComponent } from "./pages/dashboard/study-components/manage-questionnaires/preview-questionnaire-dialog/preview-questionnaire-dialog.component";
import { NavigationButtonsComponent } from "./pages/tasks/shared/navigation-buttons/navigation-buttons.component";
import { HelpQuestionnaireDialogComponent } from "./pages/dashboard/study-components/manage-questionnaires/help-questionnaire-dialog/help-questionnaire-dialog.component";
import { ManageCustomTasksComponent } from "./pages/dashboard/study-components/manage-custom-tasks/manage-custom-tasks.component";
import { CreateCustomTaskDialogComponent } from "./pages/dashboard/study-components/manage-custom-tasks/create-custom-task-dialog/create-custom-task-dialog.component";
import { CustomTaskHelpDialogComponent } from "./pages/dashboard/study-components/manage-custom-tasks/custom-task-help-dialog/custom-task-help-dialog.component";
import { CustomTaskPreviewDialogComponent } from "./pages/dashboard/study-components/manage-custom-tasks/custom-task-preview-dialog/custom-task-preview-dialog.component";
import { RaterComponent } from "./pages/tasks/rating-new/rater/rater.component";
import { DisplayComponent } from "./pages/tasks/shared/display/display.component";
import { NgZorroModule } from "./modules/ngzorro/ngzorro.module";
import { SliderComponent } from "./pages/tasks/shared/slider/slider.component";
import { RatingNewComponent } from "./pages/tasks/rating-new/rating-new.component";
import { TaskPlayerComponent } from "./pages/tasks/task-player/task-player.component";
import { ChoicerComponent } from "./pages/tasks/rating-new/choicer/choicer.component";

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        DashboardComponent,
        ColorGameComponent,
        ShapeGameComponent,
        OddballComponent,
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
        ViewStudiesComponent,
        NavbarComponent,
        CreateStudiesDialogComponent,
        CrowdSourceLoginComponent,
        ConfirmationComponent,
        FinalPageComponent,
        DataComponent,
        DemographicsQuestionnaireComponent,
        RotateDirective,
        FeedbackQuestionnaireComponent,
        DataTableComponent,
        LoaderComponent,
        NumpadComponent,
        RatingComponent,
        ChoiceComponent,
        PostChoiceComponent,
        ManageGuestsComponent,
        CreateGuestDialogComponent,
        EmbeddedPageComponent,
        SafePipe,
        StudyComponentsComponent,
        ManageQuestionnairesComponent,
        CreateQuestionnaireDialogComponent,
        PreviewQuestionnaireDialogComponent,
        NavigationButtonsComponent,
        HelpQuestionnaireDialogComponent,
        ManageCustomTasksComponent,
        CreateCustomTaskDialogComponent,
        CustomTaskHelpDialogComponent,
        CustomTaskPreviewDialogComponent,
        RaterComponent,
        RatingNewComponent,
        DisplayComponent,
        SliderComponent,
        TaskPlayerComponent,
        ChoicerComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        MaterialModule,
        NgZorroModule,
        HttpClientModule,
        ReactiveFormsModule,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JWTInterceptor,
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
