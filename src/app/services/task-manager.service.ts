import { Injectable } from '@angular/core';
import { Study } from '../models/Study';
import { StudyService } from './study.service';
import { SnackbarService } from './snackbar/snackbar.service';
import { Router } from '@angular/router';
import { SessionStorageService } from './sessionStorage.service';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { ParticipantRouteNames, RouteNames, SupportedLangs } from '../models/enums';
import { Task } from '../models/Task';
import {
    SharplabTaskConfig,
    TaskPlayerNavigationConfig,
} from '../pages/tasks/task-playables/task-player/task-player.component';
import { Observable, of } from 'rxjs';
import { TaskService } from './task.service';
import { ConsentNavigationConfig } from '../pages/shared/consent-component/consent-reader.component';
import { CanClear } from './clearance.service';
import { objIsEmpty } from '../common/commonMethods';
import { StudyUserService } from './study-user.service';
import { LoaderService } from './loader/loader.service';
import { TranslateService } from '@ngx-translate/core';
import { StudyUser } from '../models/StudyUser';
import { StudyTask } from '../models/StudyTask';
import { UserStateService } from './user-state-service';
import { CrowdSourcedUserService } from './crowdsourced-user.service';
import { snapshotToStudyTasks } from './utils';
import { IErrorNavigationState } from '../pages/error-page/error-page.component';

@Injectable({
    providedIn: 'root',
})
export class TaskManagerService implements CanClear {
    /**
     * This service is in charge of handling routing of the participant to the tasks assigned
     */

    private _currentTaskIndex: number = 0;
    private _study: Study = null;
    private _isTestMode: boolean = false;

    get study(): Study {
        return this._study;
    }

    get isTestMode() {
        return this._isTestMode;
    }

    get currentStudyTask(): StudyTask {
        return this._study ? this._study.studyTasks[this._currentTaskIndex] : null;
    }

    get hasStudy(): boolean {
        return !!this.study;
    }

    constructor(
        private studyService: StudyService,
        private snackbarService: SnackbarService,
        private router: Router,
        private crowdSourcedUserService: CrowdSourcedUserService,
        private studyUserService: StudyUserService,
        private sessionStorageService: SessionStorageService,
        private taskService: TaskService,
        private loaderService: LoaderService,
        private translateService: TranslateService,
        private userStateService: UserStateService
    ) {}

    /**
     * 1. call initStudy, which gets study from backend DB and extracts tasks
     *      we set the study id in session storage in order to persist it in case the user reloads the page
     * 2. call runStudy, which goes to the next required task and runs it
     * 3. call next, which will redirect to the next scheduled task
     *      this also coincides with a call to setTaskAsComplete(), as that increments the task index on the backend
     * 4. repeat until we are out of tasks
     * 5. call route
     */

    initStudy(studyId: number, runInTestMode?: boolean) {
        this._isTestMode = runInTestMode === undefined ? false : runInTestMode;
        this.loaderService.showLoader();
        this.sessionStorageService.setCurrentlyRunningStudyIdInSessionStorage(studyId.toString());
        this.userStateService
            .getOrUpdateUserState()
            .pipe(
                mergeMap((_user) =>
                    this.userStateService.isCrowdsourcedUser || this._isTestMode
                        ? of(null)
                        : this.studyUserService.getOrUpdateStudyUsers(true)
                ),
                mergeMap((studyUsers: null | StudyUser[]) => {
                    if (studyUsers) {
                        const studyUser = studyUsers.find((studyUser) => studyUser.studyId === studyId);
                        if (!studyUser.hasAcceptedConsent) throw new Error('user has not accepted consent');
                        this._currentTaskIndex = studyUser.currentTaskIndex;
                    } else {
                        // this is a crowdsourced user
                        this._currentTaskIndex = 0;
                    }
                    return this.studyService.getStudyById(studyId);
                }),
                mergeMap((res) => {
                    const updatedStudy: Study = {
                        ...res.body,
                        studyTasks: snapshotToStudyTasks(res.body),
                    };
                    this._study = updatedStudy;
                    return this.userStateService.isCrowdsourcedUser
                        ? this.taskService.getTaskByTaskId(res.body.consent.id)
                        : of(null);
                })
            )
            .subscribe(
                (task: Task | null) => {
                    /**
                     * Account holders must agree to consent before starting the study so we can direct them straight
                     * to the tasks.
                     * Crowdsourced users must be shown the consent first.
                     */
                    task === null ? this.runStudy() : this.showConsent(task);
                },
                (err) => {
                    this.handleErr(err);
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
    }

    public runStudy() {
        this._routeToTask(this.currentStudyTask);
    }

    private showConsent(consent: Task) {
        const config: ConsentNavigationConfig = {
            mode: this._isTestMode ? 'test' : 'actual',
            metadata: consent.config.metadata[0].componentConfig,
        };

        this.router.navigate([`${RouteNames.BLANK}`]).then(() => {
            this.router.navigate([`${RouteNames.CONSENT}`], { state: config });
        });
    }

    handleErr(err?: any): void {
        this.router.navigate(['task-error'], {
            state: {
                taskIndex: this.currentStudyTask?.taskOrder,
                studyId: this.currentStudyTask?.studyId,
                userId: this.userStateService?.currentlyLoggedInUserId,
                stackTrace: err instanceof Error ? err.stack : err,
            } as IErrorNavigationState,
        });
    }

    // ------------------------------------

    private _routeToTask(studyTask: StudyTask) {
        this.router.navigate([`${RouteNames.BLANK}`]).then(() => {
            const hasConfigOverride = !objIsEmpty(studyTask.config);

            const sharplabConfig = (hasConfigOverride ? studyTask.config : studyTask.task.config) as SharplabTaskConfig;

            const navigationConfig: TaskPlayerNavigationConfig = {
                mode: this._isTestMode ? 'test' : 'actual',
                metadata: sharplabConfig,
            };

            this.router.navigate([`${RouteNames.TASKPLAYER}`], { state: navigationConfig });
        });
    }

    private _routeToFinalPage(completionCode: string): void {
        if (this.userStateService.isCrowdsourcedUser) {
            this.loaderService.showLoader();
            this.router
                .navigate(['/complete'], { state: { completionCode: completionCode } })
                .then(() => {})
                .finally(() => {
                    this.loaderService.hideLoader();
                });
        } else if (this._isTestMode) {
            this.router.navigate([
                this.userStateService.userIsAdmin ? `admin-dashboard/studies` : `organization-member-dashboard/studies`,
            ]);
            this.snackbarService.openInfoSnackbar('Study completed');
        } else {
            this.loaderService.showLoader();
            this.studyUserService
                .getOrUpdateStudyUsers(true)
                .subscribe(
                    () => {
                        this.router.navigate([`participant-dashboard/studies`]);
                        this.snackbarService.openSuccessSnackbar(
                            this.translateService.currentLang === SupportedLangs.FR
                                ? 'Vous avez complété cette étude!'
                                : 'Study complete!'
                        );
                    },
                    (err) => {
                        this.handleErr(err);
                    }
                )
                .add(() => {
                    this.loaderService.hideLoader();
                });
        }
    }

    next(): void {
        if (!this.hasStudy) {
            this.handleErr('no study found');
            return;
        }

        // currentTaskIndex is incremented in the setTaskAsComplete method for account holders
        // this functionality is kept separate as there are cases where we want to set as complete before
        // the user officially finishes the task (when the last block is finished, not when the user hits next)
        if (this.userStateService.isCrowdsourcedUser || this._isTestMode) ++this._currentTaskIndex;

        this._handleNext();
    }

    // only for account holders because their current task index is saved in the db
    setTaskAsComplete(): Observable<boolean> {
        const studyUserForThisStudy = this.studyUserService.studyUsers.find(
            (studyUser) => studyUser.studyId === this.study.id
        );
        if (!studyUserForThisStudy) return of(false);

        return this.studyUserService
            .updateStudyUser({
                ...studyUserForThisStudy,
                currentTaskIndex: studyUserForThisStudy.currentTaskIndex + 1,
            })
            .pipe(
                tap((res) => (this._currentTaskIndex = res.currentTaskIndex)),
                map(() => true),
                catchError(() => of(false))
            );
    }

    private _handleNext() {
        const totalTasks = this.study.studyTasks.length;
        // route to next task if there is still another task to go to
        if (this._currentTaskIndex < totalTasks) {
            this._routeToTask(this.currentStudyTask);
            return;
        } else {
            if (this.userStateService.isCrowdsourcedUser) {
                this.loaderService.showLoader();
                this.crowdSourcedUserService
                    .setComplete(this.userStateService.currentlyLoggedInUserId, this.study.id)
                    .subscribe(
                        (crowdSourcedUser) => {
                            this._routeToFinalPage(crowdSourcedUser.completionCode);
                        },
                        (err) => {
                            this.handleErr(err);
                        }
                    )
                    .add(() => this.loaderService.hideLoader());
            } else {
                this._routeToFinalPage(null);
            }
        }
    }

    clearService() {
        this._study = null;
        this._currentTaskIndex = 0;
    }
}
