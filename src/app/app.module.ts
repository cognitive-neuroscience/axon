import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import * as Sentry from '@sentry/angular-ivy';
import { AppRoutingModule } from './routing/app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/landing-page/login/login.component';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './modules/material/material.module';
import { HttpClient, HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CrowdSourceLoginComponent } from './pages/landing-page/crowdsource-login/crowdsource-login.component';
import { ConfirmationComponent } from './services/confirmation/confirmation.component';
import { LoaderComponent } from './services/loader/loader.component';
import { CreateUserDialogComponent } from './pages/admin/admin-dashboard/manage-users/create-user-dialog/create-user-dialog.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { RegisterComponent } from './pages/landing-page/register/register.component';
import { AdminModule } from './pages/admin/admin.module';
import { ParticipantModule } from './pages/participant/participant.module';
import { TaskModule } from './pages/tasks/task.module';
// import { ErrorInterceptor } from './interceptors/error.interceptor';
import { SendResetPasswordComponent } from './pages/landing-page/forgot-password/send-reset-password/send-reset-password.component';
import { ResetPasswordLoginComponent } from './pages/landing-page/forgot-password/change-password-page/reset-password-login.component';
import { StudyBackgroundComponent } from './pages/landing-page/study-background/study-background.component';
import { SharedModule } from './pages/shared/shared.module';
import { NotFoundComponent } from './pages/landing-page/not-found/not-found.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SnackbarComponent } from './services/snackbar/snackbar.component';
import { OrganizationMemberModule } from './pages/organization-member/organization-member.module';
import { HttpCsrfInterceptor } from './interceptors/csrf.interceptor';
import { ErrorPageComponent } from './pages/error/error-page.component';
import { CustomErrorHandler } from './ErrorHandler';

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
        CreateUserDialogComponent,
        LandingPageComponent,
        ErrorPageComponent,
        RegisterComponent,
        SendResetPasswordComponent,
        ResetPasswordLoginComponent,
        StudyBackgroundComponent,
        NotFoundComponent,
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
        // {
        //     provide: HTTP_INTERCEPTORS,
        //     useClass: ErrorInterceptor,
        //     multi: true,
        // },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpCsrfInterceptor,
            multi: true,
        },
        {
            provide: ErrorHandler,
            useClass: CustomErrorHandler,
        },
        // {
        //     provide: ErrorHandler,
        //     useValue: Sentry.createErrorHandler({
        //         showDialog: false,
        //     }),
        // },
        {
            provide: Sentry.TraceService,
            deps: [Router],
        },
        {
            provide: APP_INITIALIZER,
            useFactory: () => () => {},
            deps: [Sentry.TraceService],
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
