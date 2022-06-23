import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of, Subscription } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { wait } from 'src/app/common/commonMethods';
import { StudyUser } from 'src/app/models/Login';
import { ConsentNavigationConfig } from 'src/app/pages/shared/consent-component/consent-reader.component';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { TaskService } from 'src/app/services/task.service';
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
        private taskService: TaskService,
        private snackbar: SnackbarService,
        private taskManager: TaskManagerService,
        private loaderService: LoaderService
    ) {}

    ngOnInit(): void {
        this._studyUsers = this.studyUserService.studyUsers;
    }

    private _studyUsers: Observable<StudyUser[]>;

    /**
     * the HTML template queries studyUsers a lot, so we use an
     * observable buffer instead of calling getStudyUsers() as that will
     * spam HTTP requests
     */
    get studyUsers(): Observable<StudyUser[]> {
        return this._studyUsers.pipe(
            map((studyUsers) =>
                studyUsers
                    ? studyUsers.sort((a, b) => {
                          const dateA = Date.parse(a.registerDate);
                          const dateB = Date.parse(b.registerDate);
                          return dateB - dateA;
                      })
                    : []
            )
        );
    }

    getProgress(studyUser: StudyUser): number {
        if (studyUser.study) {
            return studyUser.currentTaskIndex === 0
                ? 0
                : Math.ceil((studyUser.currentTaskIndex / studyUser.study.tasks.length) * 100);
        } else {
            return 0;
        }
    }

    studyIsDone(studyUser: StudyUser): boolean {
        if (studyUser?.study) {
            return studyUser.currentTaskIndex === studyUser.study.tasks.length;
        }
    }

    getButtonText(studyUser: StudyUser): string {
        if (!studyUser.study.started) {
            return 'participant-studies-page.buttons.study-not-started';
        } else if (studyUser.currentTaskIndex === 0) {
            return 'participant-studies-page.buttons.start-study';
        } else if (studyUser.currentTaskIndex === studyUser.study.tasks.length) {
            return 'participant-studies-page.buttons.study-completed';
        } else {
            return 'participant-studies-page.buttons.continue-study';
        }
    }

    openConsentDialog(studyUser: StudyUser) {
        this.loaderService.showLoader();
        this.taskService
            .getTaskByTaskId(studyUser.study.consent)
            .pipe(
                mergeMap((task) => {
                    const config: ConsentNavigationConfig = {
                        metadata: task.config.metadata[0].componentConfig,
                        mode: 'actual',
                    };
                    this.loaderService.hideLoader();
                    return this.dialog
                        .open(ConsentDialogComponent, { width: '80%', height: '80%', data: config, autoFocus: false })
                        .afterClosed();
                }),
                mergeMap((consented: boolean) => {
                    this.loaderService.showLoader();
                    const newStudyUser: StudyUser = {
                        ...studyUser,
                        hasAcceptedConsent: true,
                    };
                    return consented ? this.studyUserService.updateStudyUser(newStudyUser) : of(null);
                }),
                mergeMap((_res) => {
                    return this.studyUserService.getStudyUsers(true);
                })
            )
            .subscribe(
                (_res) => {},
                (err) => {
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
