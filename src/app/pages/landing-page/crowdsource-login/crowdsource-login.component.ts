import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SnackbarService } from '../../../services/snackbar.service';
import { TaskManagerService } from '../../../services/task-manager.service';
import { Observable, Subscription, throwError } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { mergeMap, take } from 'rxjs/operators';
import { thisOrDefault, wait } from 'src/app/common/commonMethods';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { ClearanceService } from 'src/app/services/clearance.service';
import { SupportedLangs } from 'src/app/models/enums';
import { MatDialog } from '@angular/material/dialog';
import { LanguageDialogComponent } from '../../participant/participant-dashboard/language-dialog/language-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
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

    constructor(
        private _route: ActivatedRoute,
        private _snackbarService: SnackbarService,
        private _taskManager: TaskManagerService,
        private userService: UserService,
        private loaderService: LoaderService,
        private clearanceService: ClearanceService,
        private dialog: MatDialog,
        private translateService: TranslateService,
        private sessionStorageService: SessionStorageService
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
        if (this.workerId.length === 0) return;

        this.clearanceService.clearServices();

        this.openLanguageDialog()
            .pipe(
                mergeMap((lang) => {
                    if (!lang) return throwError('user exited dialog');
                    this.translateService.use(lang);
                    this.loaderService.showLoader();
                    return this.userService.registerCrowdsourcedUser(this.workerId, this.studyId, lang);
                }),
                mergeMap((res) => {
                    this.sessionStorageService.setIsCrowdsourcedUser(true);
                    // we set this here because the getUser func requires the current study id
                    this.sessionStorageService.setCurrentlyRunningStudyIdInSessionStorage(res.studyId.toString());
                    return this.userService.getUser();
                })
            )
            .subscribe(
                async (user) => {
                    if (user) {
                        await this.startGameInFullScreen();
                        this._snackbarService.openSuccessSnackbar('Registered: ' + this.workerId);
                        this._taskManager.initStudy(this.studyId);
                    }
                },
                (err) => {
                    // if headers too large error
                    if (err.status && err.status === 431) {
                        this._snackbarService.openErrorSnackbar(
                            'There was an error. Please try again by clearing your cookies, or open the study in incognito mode.',
                            '',
                            6000
                        );
                    } else {
                        if (err !== 'user exited dialog') {
                            console.error(err);
                            this._snackbarService.openErrorSnackbar(err.message || err.error?.message);
                        }
                    }
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
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
