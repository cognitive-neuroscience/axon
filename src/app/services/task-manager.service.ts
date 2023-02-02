import { Injectable } from '@angular/core';
import { Study } from '../models/Study';
import { StudyService } from './study.service';
import { SnackbarService } from './snackbar/snackbar.service';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { SessionStorageService } from './sessionStorage.service';
import { catchError, map, mergeMap, take, tap } from 'rxjs/operators';
import { ParticipantRouteNames, RouteNames, SupportedLangs } from '../models/enums';
import { Task } from '../models/Task';
import {
    SharplabTaskConfig,
    TaskPlayerNavigationConfig,
} from '../pages/tasks/task-playables/task-player/task-player.component';
import { Observable, of, throwError } from 'rxjs';
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

@Injectable({
    providedIn: 'root',
})
export class TaskManagerService implements CanClear {
    /**
     * This service is in charge of handling routing of the participant to the tasks assigned
     */

    private _currentTaskIndex: number = 0;
    private _study: Study = null;

    get study(): Study {
        return this._study;
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

    initStudy(studyId: number) {
        this.loaderService.showLoader();
        this.sessionStorageService.setCurrentlyRunningStudyIdInSessionStorage(studyId.toString());
        this.userStateService
            .getOrUpdateUserState()
            .pipe(
                mergeMap((_user) =>
                    this.userStateService.isCrowdsourcedUser
                        ? of(null)
                        : this.studyUserService.getOrUpdateStudyUsers(true)
                ),
                mergeMap((studyUsers: null | StudyUser[]) => {
                    if (studyUsers) {
                        const studyUser = studyUsers.find((studyUser) => studyUser.study.id === studyId);
                        if (!studyUser.hasAcceptedConsent) throw new Error('user has not accepted consent');
                        this._currentTaskIndex = studyUser.currentTaskIndex;
                    } else {
                        // this is a crowdsourced user
                        this._currentTaskIndex = 0;
                    }
                    return this.studyService.getStudyById(studyId);
                }),
                mergeMap((res) => {
                    this._study = res.body;
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
                (_err) => {
                    this.handleErr();
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
            mode: 'actual',
            metadata: consent.config.metadata[0].componentConfig,
        };

        this.router.navigate([`${RouteNames.BLANK}`]).then(() => {
            this.router.navigate([`${RouteNames.CONSENT}`], { state: config });
        });
    }

    handleErr(errText?: string): void {
        if (this.userStateService.isCrowdsourcedUser) {
            this.router.navigate([ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE]);
        } else {
            this.router.navigate([ParticipantRouteNames.DASHBOARD_BASEROUTE]);
        }
        this.snackbarService.openErrorSnackbar(
            errText || 'Task Manager Error. Please contact sharplab.neuro@mcgill.ca',
            undefined,
            15000
        );
    }

    // ------------------------------------

    private _routeToTask(studyTask: StudyTask) {
        this.router.navigate([`${RouteNames.BLANK}`]).then(() => {
            const hasConfigOverride = !objIsEmpty(studyTask.config);

            const sharplabConfig = (hasConfigOverride ? studyTask.config : studyTask.task.config) as SharplabTaskConfig;

            const navigationConfig: TaskPlayerNavigationConfig = {
                mode: 'actual',
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
        } else {
            this.loaderService.showLoader();
            this.studyUserService
                .getOrUpdateStudyUsers(true)
                .subscribe(
                    () => {
                        this.router.navigate([
                            `${ParticipantRouteNames.DASHBOARD_BASEROUTE}/${ParticipantRouteNames.STUDIES_SUBROUTE}`,
                        ]);
                        this.snackbarService.openSuccessSnackbar(
                            this.translateService.currentLang === SupportedLangs.FR
                                ? 'Vous avez complété cette étude!'
                                : 'Study complete!'
                        );
                    },
                    (err) => {
                        this.snackbarService.openErrorSnackbar('there was an error');
                    }
                )
                .add(() => {
                    this.loaderService.hideLoader();
                });
        }
    }

    next(): void {
        if (!this.hasStudy) {
            this.handleErr();
            return;
        }

        // currentTaskIndex is incremented in the setTaskAsComplete method for account holders
        // this functionality is kept separate as there are cases where we want to set as complete before
        // the user officially finishes the task (when the last block is finished, not when the user hits next)
        if (this.userStateService.isCrowdsourcedUser) ++this._currentTaskIndex;

        this._handleNext();
    }

    // only for account holders because their current task index is saved in the db
    setTaskAsComplete(): Observable<boolean> {
        const studyUserForThisStudy = this.studyUserService.studyUsers.find(
            (studyUser) => studyUser.study.id === this.study.id
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
                this.crowdSourcedUserService
                    .setComplete(this.userStateService.currentlyLoggedInUserId, this.study.id)
                    .subscribe(
                        (crowdSourcedUser) => {
                            this._routeToFinalPage(crowdSourcedUser.completionCode);
                        },
                        (_err) => {
                            this.handleErr();
                        }
                    );
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
