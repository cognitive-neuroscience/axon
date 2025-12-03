import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';
import { TaskManagerService } from '../../../services/task-manager.service';
import { Observable, Subscription, of, throwError } from 'rxjs';
import { catchError, mergeMap, take, tap } from 'rxjs/operators';
import { wait } from 'src/app/common/commonMethods';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { ClearanceService } from 'src/app/services/clearance.service';
import { SupportedLangs } from 'src/app/models/enums';
import { MatDialog } from '@angular/material/dialog';
import { LanguageDialogComponent } from '../../participant/participant-dashboard/language-dialog/language-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { CrowdSourcedUserService } from 'src/app/services/crowdsourced-user.service';
import { HttpStatus } from 'src/app/models/Auth';
import { StudyService } from 'src/app/services/study.service';
declare function setFullScreen(): any;

@Component({
    selector: 'app-crowdsource-login',
    templateUrl: './crowdsource-login.component.html',
    styleUrls: ['./crowdsource-login.component.scss'],
})
export class CrowdSourceLoginComponent implements OnInit, OnDestroy {
    workerId: string = '';
    studyId: number;
    urlContainsCode: boolean = false;
    subscriptions: Subscription[] = [];
    wasClicked = false;

    constructor(
        private _route: ActivatedRoute,
        private _snackbarService: SnackbarService,
        private _taskManager: TaskManagerService,
        private userStateService: UserStateService,
        private crowdSourcedUserService: CrowdSourcedUserService,
        private loaderService: LoaderService,
        private clearanceService: ClearanceService,
        private dialog: MatDialog,
        private translateService: TranslateService,
        private sessionStorageService: SessionStorageService,
        private studyService: StudyService
    ) {}

    ngOnInit(): void {
        this._getQueryParams();
    }

    // If the url contains a study shortcode then we get it here.
    // Otherwise the user will be prompted to enter their own shortcode.
    private _getQueryParams() {
        this.subscriptions.push(
            this._route.queryParams.subscribe((params) => {
                const studyIdFromURL = params['studyid'] as string;
                if (studyIdFromURL) {
                    this.urlContainsCode = true;
                    this.studyId = parseInt(studyIdFromURL);
                }
            })
        );
    }

    onRegister() {
        if (this.wasClicked || !this.studyId) return;
        if (this.workerId.length === 0) return;

        this.wasClicked = true;
        this.clearanceService.clearServices();

        this.studyService.getStudyById(this.studyId).subscribe(
            (study) => {
                this.openLanguageDialog()
                    .pipe(
                        mergeMap((lang) => {
                            if (!lang) return throwError('user exited dialog');
                            this.translateService.use(lang);
                            this.loaderService.showLoader();
                            return of(lang);
                        }),
                        mergeMap((lang) => {
                            return this.crowdSourcedUserService.createCrowdSourcedUserAndLogin(
                                this.workerId,
                                this.studyId,
                                lang
                            );
                        }),
                        mergeMap((res) => {
                            this.sessionStorageService.setIsCrowdsourcedUser(true);
                            // we set this here because the getUser func requires the current study id
                            this.sessionStorageService.setCurrentlyRunningStudyIdInSessionStorage(
                                res.studyId.toString()
                            );
                            return this.userStateService.getOrUpdateUserState();
                        }),
                        take(1)
                    )
                    .subscribe(
                        async (user) => {
                            if (user) {
                                await this.startGameInFullScreen();
                                this._snackbarService.openSuccessSnackbar(
                                    this.translateService.currentLang === SupportedLangs.FR
                                        ? 'Votre ID a été enregistré avec succès!: ' + this.workerId
                                        : 'Regisrered ID successfully: ' + this.workerId
                                );
                                this._taskManager.initStudy(this.studyId);
                            }
                        },
                        (err: HttpStatus) => {
                            // reset wasClicked if there was some sort of issue that caused them to come back to this page
                            this.wasClicked = false;
                            // if headers too large error
                            switch (err?.status) {
                                case 431:
                                    this._snackbarService.openErrorSnackbar(
                                        'There was an error. Please try again by clearing your cookies, or open the study in incognito mode.',
                                        '',
                                        6000
                                    );
                                    break;
                                case 403:
                                    // study is either not started or has been deleted
                                    this._snackbarService.openErrorSnackbar([
                                        'Study not available',
                                        "Cette étude n'est pas disponible.",
                                    ]);
                                    break;
                                case 409:
                                    this._snackbarService.openErrorSnackbar(
                                        'A user with this ID has already registered for this study and cannot participate again.',
                                        '',
                                        15000
                                    );
                                    break;
                                default:
                                    console.error(err);
                                    this._snackbarService.openErrorSnackbar(
                                        err.message ||
                                            'CrowdSource User Login error. Please contact sharplab.neuro@mcgill.ca.'
                                    );
                                    break;
                            }
                        }
                    )
                    .add(() => {
                        this.loaderService.hideLoader();
                    });
            },
            (err) => {
                if (err.status === 404) {
                    this._snackbarService.openErrorSnackbar(['Study not found', "Cette étude n'a pas été trouvée."]);
                }
            }
        );
    }

    async startGameInFullScreen() {
        setFullScreen();
        await wait(1000); // delay to allow screen to expand
    }

    openLanguageDialog(): Observable<SupportedLangs> {
        return this.dialog.open(LanguageDialogComponent, { disableClose: true }).afterClosed().pipe(take(1));
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
