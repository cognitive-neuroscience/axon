import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, map, mergeMap, take, tap } from 'rxjs/operators';
import { SupportedLangs } from 'src/app/models/enums';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { UserService } from 'src/app/services/user.service';
import { LanguageDialogComponent } from './language-dialog/language-dialog.component';
import { StudyService } from 'src/app/services/study.service';
import { ReroutingConfig, Study } from 'src/app/models/Study';
import { InfoDisplayViewerMetadata } from '../../shared/info-display-viewer/info-display-viewer.component';
import { User } from 'src/app/models/User';
import { StudyUser } from 'src/app/models/StudyUser';

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
        const studyId = parseInt(this.sessionStorageService.getStudyIdToRegisterInSessionStorage());
        this.isLoading = true;

        const obs = this.studyService
            .getStudyById(studyId)
            .pipe(
                mergeMap((study) => {
                    const userId = this.userStateService.currentlyLoggedInUserId;
                    const parsedUserId = parseInt(userId);

                    return this.getRerouteCompletionCriteria(study.body.config, parsedUserId);
                }),
                catchError((err) => (err.status === 409 ? of(null) : throwError(err)))
            )
            .subscribe((rerouteconfig: ReroutingConfig['rerouteConfig'] | null) => {
                if (rerouteconfig) {
                    this.sessionStorageService.setStudyIdToRegisterInSessionStorage(rerouteconfig.rerouteTo.toString());
                    // ...TODO: finish this up. Combine this logic with the below stream. This should simply alter
                    // the studyId that is saved in session storage depending on the reroute config
                }
            });

        // const obs = this.userStateService
        //     .getOrUpdateUserState()
        //     .pipe(
        //         mergeMap((res) =>
        //             res?.lang === SupportedLangs.NONE
        //                 ? this.openLanguageDialog().pipe(
        //                       mergeMap((lang) => this.userService.updateUser({ ...res, lang }))
        //                   )
        //                 : of(res)
        //         ),
        //         tap((user) => this.translateService.use(user?.lang)),
        //         mergeMap((user) => {
        //             this.loaderService.showLoader();
        //             // register the participant for the given study saved in session storage if it exists
        //             return studyId ? this.studyUserService.registerParticipantForStudy(user, studyId) : of(null);
        //         }),
        //         // if 409 (conflict) then we dont want an error
        //         catchError((err) => (err.status === 409 ? of(null) : throwError(err))),
        //         mergeMap((_res) => {
        //             // force update as sometimes the retrieved studyUsers value is cached elsewhere
        //             // and does not reflect our recent call to registerParticipantForStudy
        //             return this.studyUserService.getOrUpdateStudyUsers(true);
        //         })
        //     )
        //     .subscribe(
        //         (_res) => {
        //             // noop
        //         },
        //         (err) => {
        //             if (err.status === 401) {
        //                 this.snackbarService.openErrorSnackbar('forbidden');
        //                 this.authService.logout(false);
        //             } else {
        //                 console.error(err);
        //             }
        //         }
        //     )
        //     .add(() => {
        //         // this.sessionStorageService.removeStudyIdToRegisterInSessionStorage();
        //         this.isLoading = false;
        //         this.loaderService.hideLoader();
        //     });

        this.subscriptions.push(obs);
    }

    getRerouteCompletionCriteria(
        studyConfig: Study['config'],
        userId: number
    ): Observable<ReroutingConfig['rerouteConfig']['mustComplete'][0] | null> {
        const typedConfig = studyConfig as InfoDisplayViewerMetadata & ReroutingConfig;
        if (!typedConfig) return of(null);

        const studyTaskRequests = typedConfig.rerouteConfig.mustComplete.map((val) =>
            this.studyUserService.getStudyUserByUserAndStudyId(val.studyId, userId)
        );

        return forkJoin(studyTaskRequests).pipe(
            map((responses) => {
                responses.forEach((response) => {
                    // getStudyUserByUserAndStudyId returns null if studyUser does not exist.
                    // we do not want to reroute if the studyUser does not exist for all responses
                    if (!response) return;
                    const mustComplete = typedConfig.rerouteConfig.mustComplete.find(
                        (val) => val.studyId === response.studyId
                    );
                    if (!mustComplete) return; // cannot find completion criteria for this study. Technically we should never hit this case

                    if (response.currentTaskIndex >= mustComplete.currentTaskIndex) {
                        return typedConfig.rerouteConfig.rerouteTo;
                    } else {
                        return;
                    }
                });
                return null;
            })
        );
    }

    openLanguageDialog(): Observable<SupportedLangs> {
        return this.dialog.open(LanguageDialogComponent, { disableClose: true }).afterClosed().pipe(take(1));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
