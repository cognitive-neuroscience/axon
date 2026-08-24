import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, finalize, map, mergeMap, take, tap } from 'rxjs/operators';
import { SupportedLangs } from 'src/app/models/enums';
import { getOrganizationSupportedLangs, shouldPromptForOrganizationLang } from 'src/app/models/Organization';
import { Study } from 'src/app/models/Study';
import { StudyUser } from 'src/app/models/StudyUser';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { StudyService } from 'src/app/services/study.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { UserService } from 'src/app/services/user.service';
import { LocalStorageService } from 'src/app/services/localStorageService.service';
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
        private studyService: StudyService,
        private localStorageService: LocalStorageService
    ) {}

    private shouldReroute(studyConfig: Study['config'], studyUsers: StudyUser[]): boolean {
        if (!studyConfig?.rerouteConfig?.mustCompleteOneOf) return false;

        return studyConfig?.rerouteConfig.mustCompleteOneOf.some(({ studyId, currentTaskIndex }) => {
            const hasStudyUserForStudy = studyUsers.find((studyUser) => studyUser.studyId === studyId);
            if (!hasStudyUserForStudy) return false;

            return hasStudyUserForStudy.currentTaskIndex >= currentTaskIndex;
        });
    }

    ngOnInit(): void {
        const studyIdFromStorage = this.sessionStorageService.getStudyIdToRegisterInSessionStorage();
        let studyId = studyIdFromStorage ? parseInt(studyIdFromStorage) : NaN;
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
                const studyBody = study.body;
                if (!studyBody || !studyUsers) return;
                if (this.shouldReroute(studyBody.config, studyUsers)) {
                    const rerouteTo = studyBody.config?.rerouteConfig?.rerouteTo;
                    if (rerouteTo) studyId = rerouteTo;
                }
            })
        );

        const init$: Observable<unknown> = studyId ? redirectSub : of(null);

        sub = init$
            .pipe(
                mergeMap(() => this.userStateService.getOrUpdateUserState(true)),
                mergeMap((res: User | null) => {
                    this.loaderService.hideLoader();
                    const preferredLang = this.localStorageService.getPreferredLangInLocalStorage();
                    if (!res || !shouldPromptForOrganizationLang(res.lang, preferredLang, res.organization)) {
                        return of(res);
                    }
                    return this.openLanguageDialog(getOrganizationSupportedLangs(res.organization)).pipe(
                        mergeMap((lang) => this.userService.updateUser({ ...res, lang }))
                    );
                }),
                tap((user: User | null) => {
                    this.translateService.use(user?.lang ? user.lang : SupportedLangs.EN);
                    this.loaderService.showLoader();
                }),
                mergeMap((user: User | null) => {
                    // register the participant for the given study saved in session storage if it exists
                    return studyId && user
                        ? this.studyUserService.registerParticipantForStudy(user, studyId)
                        : of(null);
                }),
                // force update as sometimes the retrieved studyUsers value is cached elsewhere
                // and does not reflect our recent call to registerParticipantForStudy
                mergeMap(() => this.studyUserService.getOrUpdateStudyUsers(true)),
                // if 409 (conflict) then we dont want to show an error – it just means that the user is already registered for the study
                // if 403 (forbidden) then we dont want to show an error – it just means that the user is not allowed to register for the study
                catchError((err) => {
                    if (err.status === 409) {
                        return of(null);
                    } else if (err.status === 403) {
                        const message = this.translateService.instant('errorMessages.studyNotAvailable');
                        this.snackbarService.openErrorSnackbar(`${message}: ${studyId}`);
                        return of(null);
                    } else {
                        return throwError(err);
                    }
                }),
                // finalize runs regardless of how the observable completes (success, error, or unsubscription)
                finalize(() => {
                    this.sessionStorageService.removeStudyIdToRegisterInSessionStorage();
                    this.isLoading = false;
                    this.loaderService.hideLoader();
                })
            )
            .subscribe(
                () => {},
                (err: { status?: number }) => {
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

    openLanguageDialog(supportedLangs: SupportedLangs[]): Observable<SupportedLangs> {
        return this.dialog
            .open(LanguageDialogComponent, { disableClose: true, data: { supportedLangs } })
            .afterClosed()
            .pipe(take(1));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
