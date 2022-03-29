import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '../pages/landing-page/login/login.component';
import { FinalPageComponent } from '../pages/participant/final-page/final-page.component';
import { LandingPageComponent } from '../pages/landing-page/landing-page.component';
import { RegisterComponent } from '../pages/landing-page/register/register.component';
import { ParticipantRouteNames, RouteNames } from '../models/enums';
import { CrowdSourceLoginComponent } from '../pages/landing-page/crowdsource-login/crowdsource-login.component';
import { TaskPlayerComponent } from '../pages/tasks/task-playables/task-player/task-player.component';
import { ConsentPageComponent } from '../pages/tasks/consent/consent-page/consent-page.component';
import { SendResetPasswordComponent } from '../pages/landing-page/forgot-password/send-reset-password/send-reset-password.component';
import { ResetPasswordLoginComponent } from '../pages/landing-page/forgot-password/change-password-page/reset-password-login.component';
import { StudyBackgroundComponent } from '../pages/landing-page/study-background/study-background.component';
import { NotFoundComponent } from '../pages/landing-page/not-found/not-found.component';
import { BlankComponent } from '../pages/tasks/blank/blank.component';

const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
        children: [
            { path: '', redirectTo: RouteNames.LANDINGPAGE_LOGIN_BASEROUTE, pathMatch: 'full' },
            { path: RouteNames.LANDINGPAGE_LOGIN_BASEROUTE, component: LoginComponent },
            { path: RouteNames.LANDINGPAGE_REGISTER_BASEROUTE, component: RegisterComponent },
            { path: RouteNames.LANDINGPAGE_FORGOT_PASSWORD_BASEROUTE, component: SendResetPasswordComponent },
            {
                path: RouteNames.LANDINGPAGE_RESET_PASSWORD_BASEROUTE,
                component: ResetPasswordLoginComponent,
            },
        ],
    },
    {
        path: ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE,
        component: CrowdSourceLoginComponent,
    },
    {
        path: RouteNames.CONSENT,
        component: ConsentPageComponent,
    },
    {
        path: RouteNames.TASKPLAYER,
        component: TaskPlayerComponent,
    },
    {
        path: RouteNames.LANDINGPAGE_STUDIES_BASEROUTE,
        children: [
            {
                path: '',
                redirectTo: `/${RouteNames.LANDINGPAGE_NOTFOUND}`, // "/" sets the absolute path, /#/studies without an ID is not a valid URL
                pathMatch: 'full',
            },
            {
                path: ':id',
                component: StudyBackgroundComponent,
            },
        ],
    },
    { path: 'blank', component: BlankComponent },
    { path: 'complete', component: FinalPageComponent },
    { path: 'notfound', component: NotFoundComponent },
    { path: '**', component: NotFoundComponent },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            useHash: true,
            relativeLinkResolution: 'legacy',
            scrollPositionRestoration: 'enabled',
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
