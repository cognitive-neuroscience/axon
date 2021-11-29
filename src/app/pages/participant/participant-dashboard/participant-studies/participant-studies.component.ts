import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { wait } from 'src/app/common/commonMethods';
import { StudyUser } from 'src/app/models/Login';
import { ConsentNavigationConfig } from 'src/app/pages/shared/consent-component/consent-reader.component';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { TaskService } from 'src/app/services/task.service';
import { UserService } from 'src/app/services/user.service';
import { FeedbackQuestionnaireComponent } from '../../final-page/feedback-questionnaire/feedback-questionnaire.component';
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
        private userService: UserService,
        private dialog: MatDialog,
        private taskService: TaskService,
        private snackbar: SnackbarService,
        private taskManager: TaskManagerService,
        private loaderService: LoaderService,
        private translateService: TranslateService
    ) {}

    ngOnInit(): void {
        this._studyUsers = this.userService.studyUsers;
        if (!this.userService.hasStudyUsers) this.userService.updateStudyUsers();

        this.translateService.setDefaultLang('en');
    }

    private _studyUsers: Observable<StudyUser[]>;

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
        this.taskService
            .getTaskByTaskId(studyUser.study.consent)
            .pipe(
                mergeMap((task) => {
                    const config: ConsentNavigationConfig = {
                        metadata: task.config,
                        mode: 'actual',
                    };
                    return this.dialog
                        .open(ConsentDialogComponent, { width: '80%', height: '80%', data: config })
                        .afterClosed();
                }),
                mergeMap((consented: boolean) => {
                    const newStudyUser: StudyUser = {
                        ...studyUser,
                        hasAcceptedConsent: true,
                    };
                    return consented ? this.userService.updateStudyUser(newStudyUser) : of(null);
                })
            )
            .subscribe(
                (res) => {
                    this.userService.updateStudyUsers();
                },
                (err) => {
                    this.snackbar.openErrorSnackbar(err.message);
                }
            );
    }

    async startOrContinueStudy(studyUser: StudyUser) {
        this.loaderService.showLoader();
        await this.startGameInFullScreen();
        this.loaderService.hideLoader();
        this.taskManager.configureStudy(studyUser.studyId, studyUser.currentTaskIndex);
    }

    async startGameInFullScreen() {
        setFullScreen();
        await wait(1000); // delay to allow screen to expand
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
