import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './routing/app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/landing-page/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './modules/material/material.module';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CrowdSourceLoginComponent } from './pages/landing-page/crowdsource-login/crowdsource-login.component';
import { ConfirmationComponent } from './services/confirmation/confirmation.component';
import { LoaderComponent } from './services/loader/loader.component';
import { CreateGuestDialogComponent } from './pages/admin/admin-dashboard/manage-guests/create-guest-dialog/create-guest-dialog.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { RegisterComponent } from './pages/landing-page/register/register.component';
import { AdminModule } from './pages/admin/admin.module';
import { ParticipantModule } from './pages/participant/participant.module';
import { TaskModule } from './pages/tasks/task.module';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { SendResetPasswordComponent } from './pages/landing-page/forgot-password/send-reset-password/send-reset-password.component';
import { ResetPasswordLoginComponent } from './pages/landing-page/forgot-password/change-password-page/reset-password-login.component';
import { StudyBackgroundComponent } from './pages/landing-page/study-background/study-background.component';
import { SharedModule } from './pages/shared/shared.module';
import { NotFoundComponent } from './pages/landing-page/not-found/not-found.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SnackbarComponent } from './services/snackbar/snackbar.component';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, '../assets/translate/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        CrowdSourceLoginComponent,
        ConfirmationComponent,
        LoaderComponent,
        CreateGuestDialogComponent,
        LandingPageComponent,
        RegisterComponent,
        SendResetPasswordComponent,
        ResetPasswordLoginComponent,
        StudyBackgroundComponent,
        NotFoundComponent,
        SnackbarComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        MaterialModule,
        AdminModule,
        ParticipantModule,
        TaskModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),

        /**
         * this import must be last as it contains the wild card routes to catch everything.
         * If it is not last, then it will catch requests meant for child routing modules
         * and redirect to the not found error page
         */
        AppRoutingModule,
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
