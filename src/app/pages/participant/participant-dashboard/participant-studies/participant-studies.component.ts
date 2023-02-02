import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { wait } from 'src/app/common/commonMethods';
import { HttpStatus } from 'src/app/models/Auth';
import { StudyUser } from 'src/app/models/StudyUser';
import { ConsentNavigationConfig } from 'src/app/pages/shared/consent-component/consent-reader.component';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { ConsentDialogComponent } from './consent-dialog/consent-dialog.component';
declare function setFullScreen(): any;

@Component({
    selector: 'app-participant-studies',
    templateUrl: './participant-studies.component.html',
    styleUrls: ['./participant-studies.component.scss'],
})
export class ParticipantStudiesComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];

    constructor(
        private studyUserService: StudyUserService,
        private dialog: MatDialog,
        private snackbar: SnackbarService,
        private taskManager: TaskManagerService,
        private loaderService: LoaderService,
        private userStateService: UserStateService
    ) {}

    ngOnInit(): void {
        this.studyUserService.getOrUpdateStudyUsers().subscribe(() => {});
    }

    /**
     * the HTML template queries studyUsers a lot, so we use an
     * observable buffer instead of calling getStudyUsers() as that will
     * spam HTTP requests
     */
    get studyUsers(): StudyUser[] {
        return this.studyUserService.studyUsers.sort((a, b) => {
            const aIsDone = this.studyIsDone(a);
            const bIsDone = this.studyIsDone(b);

            const dateA = Date.parse(a.registerDate);
            const dateB = Date.parse(b.registerDate);

            if (aIsDone && bIsDone) {
                return dateB - dateA;
            } else if (aIsDone && !bIsDone) {
                return 1;
            } else if (!aIsDone && bIsDone) {
                return -1;
            } else {
                return dateB - dateA;
            }
        });
    }

    get userId(): number {
        return this.userStateService.userValue?.id || null;
    }

    getProgress(studyUser: StudyUser): number {
        if (studyUser.study) {
            return studyUser.currentTaskIndex === 0
                ? 0
                : Math.ceil((studyUser.currentTaskIndex / (studyUser.study.studyTasks || []).length) * 100);
        } else {
            return 0;
        }
    }

    studyIsDone(studyUser: StudyUser): boolean {
        if (studyUser?.study) {
            return studyUser.currentTaskIndex === (studyUser.study.studyTasks || []).length;
        }
    }

    getButtonText(studyUser: StudyUser): string {
        if (!studyUser.study.started) {
            return 'participant-studies-page.buttons.study-not-started';
        } else if (studyUser.currentTaskIndex === 0) {
            return 'participant-studies-page.buttons.start-study';
        } else if (studyUser.currentTaskIndex === (studyUser.study.studyTasks || []).length) {
            return 'participant-studies-page.buttons.study-completed';
        } else {
            return 'participant-studies-page.buttons.continue-study';
        }
    }

    openConsentDialog(studyUser: StudyUser) {
        const config: ConsentNavigationConfig = {
            metadata: studyUser.study.consent.config.metadata[0].componentConfig,
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
                    return consentData ? this.studyUserService.updateStudyUser(updatedStudyUser) : of(null);
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
            this.taskManager.initStudy(studyUser.study.id);
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
