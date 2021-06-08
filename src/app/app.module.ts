import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./routing/app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./pages/landing-page/login/login.component";
import { ConsentComponent } from "./pages/tasks/other/consent/consent.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "./modules/material/material.module";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { CrowdSourceLoginComponent } from "./pages/landing-page/crowdsource-login/crowdsource-login.component";
import { ConfirmationComponent } from "./services/confirmation/confirmation.component";
import { LoaderComponent } from "./services/loader/loader.component";
import { CreateGuestDialogComponent } from "./pages/admin/admin-dashboard/manage-guests/create-guest-dialog/create-guest-dialog.component";
import { CreateQuestionnaireDialogComponent } from "./pages/admin/admin-dashboard/study-components/manage-questionnaires/create-questionnaire-dialog/create-questionnaire-dialog.component";
import { HelpQuestionnaireDialogComponent } from "./pages/admin/admin-dashboard/study-components/manage-questionnaires/help-questionnaire-dialog/help-questionnaire-dialog.component";
import { LandingPageComponent } from "./pages/landing-page/landing-page.component";
import { RegisterComponent } from "./pages/landing-page/register/register.component";
import { AdminModule } from "./pages/admin/admin.module";
import { ParticipantModule } from "./pages/participant/participant.module";
import { TaskModule } from "./pages/tasks/task.module";
import { ErrorInterceptor } from "./interceptors/error.interceptor";

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        ConsentComponent,
        CrowdSourceLoginComponent,
        ConfirmationComponent,
        LoaderComponent,
        CreateGuestDialogComponent,
        CreateQuestionnaireDialogComponent,
        HelpQuestionnaireDialogComponent,
        LandingPageComponent,
        RegisterComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        MaterialModule,
        AdminModule,
        ParticipantModule,
        TaskModule,
        ReactiveFormsModule,
        HttpClientModule,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
