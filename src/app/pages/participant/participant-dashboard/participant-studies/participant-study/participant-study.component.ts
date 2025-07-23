import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { wait } from 'src/app/common/commonMethods';
import { HttpStatus } from 'src/app/models/Auth';
import { Study } from 'src/app/models/Study';
import { StudyUser } from 'src/app/models/StudyUser';
import { ConsentNavigationConfig } from 'src/app/pages/shared/consent-component/consent-reader.component';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { StudyService } from 'src/app/services/study.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { ConsentDialogComponent } from '../consent-dialog/consent-dialog.component';
declare function setFullScreen(): any;

@Component({
    selector: 'app-participant-study',
    templateUrl: './participant-study.component.html',
    styleUrls: ['./participant-study.component.scss'],
})
export class ParticipantStudyComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];
    @Input() studyUser: StudyUser;

    studyUserStudy: Study;
    isLoading: boolean;

    constructor(
        private studyUserService: StudyUserService,
        private dialog: MatDialog,
        private snackbar: SnackbarService,
        private taskManager: TaskManagerService,
        private loaderService: LoaderService,
        private userStateService: UserStateService,
        private studyService: StudyService
    ) {}

    ngOnInit(): void {
        this.isLoading = true;
        this.subscriptions.push(
            this.studyService
                .getStudyById(this.studyUser.studyId)
                .subscribe((study) => {
                    this.studyUserStudy = study.body;
                })
                .add(() => {
                    this.isLoading = false;
                })
        );
    }

    get userId(): number {
        return this.userStateService.userValue?.id || null;
    }

    getProgress(studyUser: StudyUser): number {
        if (this.studyUserStudy) {
            return studyUser.currentTaskIndex === 0
                ? 0
                : Math.ceil((studyUser.currentTaskIndex / (this.studyUserStudy.studyTasks || []).length) * 100);
        } else {
            return 0;
        }
    }

    studyIsDone(studyUser: StudyUser): boolean {
        if (this.studyUserStudy) {
            return studyUser.currentTaskIndex === (this.studyUserStudy.studyTasks || []).length;
        }
    }

    getButtonText(studyUser: StudyUser): string {
        if (!this.studyUserStudy.started) {
            return 'participant-studies-page.buttons.study-not-started';
        } else if (studyUser.currentTaskIndex === 0) {
            return 'participant-studies-page.buttons.start-study';
        } else if (studyUser.currentTaskIndex === (this.studyUserStudy.studyTasks || []).length) {
            return 'participant-studies-page.buttons.study-completed';
        } else {
            return 'participant-studies-page.buttons.continue-study';
        }
    }

    openConsentDialog(studyUser: StudyUser) {
        const config: ConsentNavigationConfig = {
            metadata: this.studyUserStudy.consent.config.metadata[0].componentConfig,
            mode: 'actual',
        };
        this.dialog
            .open(ConsentDialogComponent, {
                width: '80%',
                height: '80%',
                data: config,
                autoFocus: false,
            })
            .afterClosed()
            .pipe(
                mergeMap((consentData: Record<string, string> | undefined) => {
                    // consentData is undefined if the user exited the dialog or did not consent
                    const updatedStudyUser: StudyUser = {
                        ...studyUser,
                        data: consentData,
                        hasAcceptedConsent: true,
                    };
                    this.loaderService.showLoader();
                    return consentData ? this.studyUserService.updateStudyUser(updatedStudyUser) : of(null); // this will push an update to the parent studyUsers list
                })
            )
            .subscribe(
                (_res) => {},
                (err: HttpStatus) => {
                    this.snackbar.openErrorSnackbar(err.message);
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
    }

    async startOrContinueStudy(studyUser: StudyUser) {
        if (studyUser.hasAcceptedConsent) {
            this.loaderService.showLoader();
            await this.startGameInFullScreen();
            this.loaderService.hideLoader();
            this.taskManager.initStudy(studyUser.studyId);
        } else {
            this.snackbar.openErrorSnackbar('you must view and accept the consent form before starting');
        }
    }

    async startGameInFullScreen() {
        setFullScreen();
        await wait(1000); // delay to allow screen to expand
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
