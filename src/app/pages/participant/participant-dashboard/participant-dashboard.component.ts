import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, finalize, map, mergeMap, take, tap } from 'rxjs/operators';
import { SupportedLangs } from 'src/app/models/enums';
import { Study } from 'src/app/models/Study';
import { StudyUser } from 'src/app/models/StudyUser';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { StudyService } from 'src/app/services/study.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { UserService } from 'src/app/services/user.service';
import { LanguageDialogComponent } from './language-dialog/language-dialog.component';

@Component({
    selector: 'app-participant-dashboard',
    templateUrl: './participant-dashboard.component.html',
    styleUrls: ['./participant-dashboard.component.scss'],
})
export class ParticipantDashboardComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];
    isLoading: boolean = false;

    constructor(
        private sessionStorageService: SessionStorageService,
        private userService: UserService,
        private studyUserService: StudyUserService,
        private dialog: MatDialog,
        private translateService: TranslateService,
        private loaderService: LoaderService,
        private userStateService: UserStateService,
        private authService: AuthService,
        private snackbarService: SnackbarService,
        private studyService: StudyService
    ) {}

    ngOnInit(): void {
        let studyId = parseInt(this.sessionStorageService.getStudyIdToRegisterInSessionStorage());
        this.isLoading = true;
        this.loaderService.showLoader();

        let sub: Subscription;

        const redirectSub = this.studyService.getStudyById(studyId).pipe(
            mergeMap((study) => {
                return this.studyUserService
                    .getOrUpdateStudyUsers(true)
                    .pipe(map((studyUsers) => ({ study, studyUsers })));
            }),
            tap(({ study, studyUsers }) => {
                if (this.shouldReroute(study.body.config, studyUsers)) {
                    studyId = study.body.config.rerouteConfig.rerouteTo;
                }
            })
        );

        sub = (studyId ? redirectSub : of(null))
            .pipe(
                mergeMap(() => this.userStateService.getOrUpdateUserState(true)),
                mergeMap((res) => {
                    this.loaderService.hideLoader();
                    return res?.lang === SupportedLangs.NONE
                        ? this.openLanguageDialog().pipe(
                              mergeMap((lang) => this.userService.updateUser({ ...res, lang }))
                          )
                        : of(res);
                }),
                tap((user) => {
                    this.translateService.use(user?.lang ? user.lang : SupportedLangs.EN);
                    this.loaderService.showLoader();
                }),
                mergeMap((user) => {
                    // register the participant for the given study saved in session storage if it exists
                    return studyId ? this.studyUserService.registerParticipantForStudy(user, studyId) : of(null);
                }),
                // force update as sometimes the retrieved studyUsers value is cached elsewhere
                // and does not reflect our recent call to registerParticipantForStudy
                mergeMap(() => this.studyUserService.getOrUpdateStudyUsers(true)),
                // if 409 (conflict) then we dont want an error
                catchError((err) => (err.status === 409 ? of(null) : throwError(err))),
                // finalize runs regardless of how the observable completes (success, error, or unsubscription)
                finalize(() => {
                    this.sessionStorageService.removeStudyIdToRegisterInSessionStorage();
                    this.isLoading = false;
                    this.loaderService.hideLoader();
                })
            )
            .subscribe(
                (_res) => {
                    // noop
                    _res;
                },
                (err) => {
                    if (err.status === 401) {
                        this.snackbarService.openErrorSnackbar('forbidden');
                        this.authService.logout(false);
                    } else {
                        console.error(err);
                    }
                }
            );

        this.subscriptions.push(sub);
    }

    shouldReroute(studyConfig: Study['config'], studyUsers: StudyUser[]): boolean {
        if (!studyConfig?.rerouteConfig?.mustCompleteOneOf) return false;

        return studyConfig?.rerouteConfig.mustCompleteOneOf.some(({ studyId, currentTaskIndex }) => {
            const hasStudyUserForStudy = studyUsers.find((studyUser) => studyUser.studyId === studyId);
            if (!hasStudyUserForStudy) return false;

            return hasStudyUserForStudy.currentTaskIndex >= currentTaskIndex;
        });
    }

    openLanguageDialog(): Observable<SupportedLangs> {
        return this.dialog.open(LanguageDialogComponent, { disableClose: true }).afterClosed().pipe(take(1));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
