import { HttpClient, HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { MaterialModule } from './modules/material/material.module';
import { CreateUserDialogComponent } from './pages/admin/admin-dashboard/manage-users/create-user-dialog/create-user-dialog.component';
import { AdminModule } from './pages/admin/admin.module';
import { CrowdSourceLoginComponent } from './pages/landing-page/crowdsource-login/crowdsource-login.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginComponent } from './pages/landing-page/login/login.component';
import { RegisterComponent } from './pages/landing-page/register/register.component';
import { ParticipantModule } from './pages/participant/participant.module';
import { TaskModule } from './pages/tasks/task.module';
import { AppRoutingModule } from './routing/app-routing.module';
import { ConfirmationComponent } from './services/confirmation/confirmation.component';
import { LoaderComponent } from './services/loader/loader.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpCsrfInterceptor } from './interceptors/csrf.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { ResetPasswordLoginComponent } from './pages/landing-page/forgot-password/change-password-page/reset-password-login.component';
import { SendResetPasswordComponent } from './pages/landing-page/forgot-password/send-reset-password/send-reset-password.component';
import { NotFoundComponent } from './pages/landing-page/not-found/not-found.component';
import { StudyBackgroundComponent } from './pages/landing-page/study-background/study-background.component';
import { OrganizationMemberModule } from './pages/organization-member/organization-member.module';
import { SharedModule } from './pages/shared/shared.module';
import { SnackbarComponent } from './services/snackbar/snackbar.component';
import CustomErrorHandler from './CustomErrorHandler';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { NotAllowedComponent } from './pages/landing-page/not-allowed/not-allowed.component';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, '../assets/translate/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        ErrorPageComponent,
        LoginComponent,
        CrowdSourceLoginComponent,
        ConfirmationComponent,
        LoaderComponent,
        CreateUserDialogComponent,
        LandingPageComponent,
        RegisterComponent,
        SendResetPasswordComponent,
        ResetPasswordLoginComponent,
        StudyBackgroundComponent,
        NotFoundComponent,
        NotAllowedComponent,
        SnackbarComponent,
    ],
    imports: [
        HttpClientXsrfModule.withOptions({
            cookieName: '_csrf',
            headerName: 'X-CSRF-TOKEN',
        }),
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        MaterialModule,
        AdminModule,
        OrganizationMemberModule,
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
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpCsrfInterceptor,
            multi: true,
        },
        {
            provide: ErrorHandler,
            useClass: CustomErrorHandler,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
