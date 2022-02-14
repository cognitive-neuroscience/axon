import { Injectable } from '@angular/core';
import { Study } from '../models/Study';
import { StudyService } from './study.service';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { SessionStorageService } from './sessionStorage.service';
import { map, mergeMap, take } from 'rxjs/operators';
import { ParticipantRouteNames, Platform, RouteNames, TaskType } from '../models/enums';
import { StudyTask, Task } from '../models/Task';
import { TaskPlayerNavigationConfig } from '../pages/tasks/task-playables/task-player/task-player.component';
import { QuestionnaireNavigationConfig } from '../pages/tasks/questionnaire-reader/questionnaire-reader.component';
import { Observable, of } from 'rxjs';
import { TaskService } from './task.service';
import { ConsentNavigationConfig } from '../pages/shared/consent-component/consent-reader.component';
import { EmbeddedPageNavigationConfig } from '../pages/tasks/embedded-page/embedded-page.component';
import { CanClear } from './clearance.service';
import { objIsEmpty } from '../common/commonMethods';
import { InfoDisplayNavigationConfig } from '../pages/tasks/info-display/info-display.component';

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
        return this._study ? this._study.tasks[this._currentTaskIndex] : null;
    }

    get hasStudy(): boolean {
        return !!this.study;
    }

    constructor(
        private _studyService: StudyService,
        private _snackbarService: SnackbarService,
        private _router: Router,
        private _userService: UserService,
        private _sessionStorageService: SessionStorageService,
        private _taskService: TaskService
    ) {}

    // 1. call startStudy, which gets study from backend DB and extracts tasks
    // 2. keep track of task number and route user to task
    // 3. when finished, the task will call taskFinished and we increment the task number
    // 4. repeat until we are out of tasks. Display completion code

    configureStudy(studyId: number, currentIndex: number) {
        this._currentTaskIndex = currentIndex;
        this._studyService
            .getStudyById(studyId)
            .pipe(
                map((res) => res.body),
                mergeMap((study) => {
                    this._study = study;
                    if (!this._userService.userHasValue) this._userService.updateUser();
                    return this._userService.isCrowdsourcedUser
                        ? this._taskService.getTaskByTaskId(study.consent)
                        : of(null);
                }),
                take(1)
            )
            .subscribe(
                (task: Task) => {
                    if (task === null) {
                        // account holders already have to agree to the consent before beginning the study
                        // so they have already seen it
                        this.startAfterConsent();
                    } else {
                        // crowdsourced user, always show consent in the beginning
                        this.showConsent(task);
                    }
                },
                (_err) => {
                    this.handleErr();
                }
            );
    }

    private showConsent(consent: Task) {
        const config: ConsentNavigationConfig = {
            mode: 'actual',
            metadata: consent.config,
        };

        this._router.navigate([`${RouteNames.CONSENT}`], { state: config });
    }

    startAfterConsent() {
        this._routeToTask(this.currentStudyTask);
    }

    handleErr(): void {
        this._sessionStorageService.clearSessionStorage();
        if (this._userService.isCrowdsourcedUser) {
            this._router.navigate([ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE]);
        } else {
            this._router.navigate([ParticipantRouteNames.DASHBOARD_BASEROUTE]);
        }
        this._snackbarService.openErrorSnackbar(
            'There was an error. Please contact sharplab.neuro@mcgill.ca',
            undefined,
            15000
        );
    }

    // ------------------------------------

    private _routeToTask(studyTask: StudyTask) {
        this._router.navigate([`${ParticipantRouteNames.DASHBOARD_BASEROUTE}`]).then(() => {
            if (studyTask.task.fromPlatform === Platform.PAVLOVIA) {
                // taskType can also be experimental or NAB from pavlovia
                const navigationConfig: EmbeddedPageNavigationConfig = {
                    mode: 'actual',
                    config: {
                        externalURL: studyTask.task.externalURL,
                        task: studyTask.task,
                    },
                };
                this._router.navigate([RouteNames.PAVLOVIA], { state: navigationConfig });
            } else if (studyTask.task.taskType === TaskType.QUESTIONNAIRE) {
                // if config object is empty, that means we use the default config.
                // otherwise, use the overriding config
                const config = objIsEmpty(studyTask.config) ? studyTask.task.config : studyTask.config;
                const navigationConfig: QuestionnaireNavigationConfig = {
                    metadata: config,
                    mode: 'actual',
                };
                this._router.navigate([RouteNames.QUESTIONNAIRE], { state: navigationConfig });
            } else if (studyTask.task.taskType === TaskType.EXPERIMENTAL || studyTask.task.taskType === TaskType.NAB) {
                const config = objIsEmpty(studyTask.config) ? studyTask.task.config : studyTask.config;
                const navigationConfig: TaskPlayerNavigationConfig = {
                    metadata: config,
                    mode: 'actual',
                };
                this._router.navigate([RouteNames.TASKPLAYER], { state: navigationConfig });
            } else if (studyTask.task.taskType === TaskType.INFO_DISPLAY) {
                const config = objIsEmpty(studyTask.config) ? studyTask.task.config : studyTask.config;
                const navigationConfig: InfoDisplayNavigationConfig = {
                    metadata: config,
                    mode: 'actual',
                };
                this._router.navigate([RouteNames.INFO_DISPLAY], { state: navigationConfig });
            }
        });
    }

    private _routeToFinalPage(completionCode: string): void {
        if (this._userService.isCrowdsourcedUser) {
            this._router.navigate(['/complete'], { state: { completionCode: completionCode } });
        } else {
            this._userService.updateStudyUsers();
            this._router.navigate([
                `${ParticipantRouteNames.DASHBOARD_BASEROUTE}/${ParticipantRouteNames.STUDIES_SUBROUTE}`,
            ]);
            this._snackbarService.openSuccessSnackbar('Completed Study!');
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
        if (this._userService.isCrowdsourcedUser) ++this._currentTaskIndex;

        this.handleNext();
    }

    // only for account holders because their current task index is saved in the db
    setTaskAsComplete(): Observable<boolean> {
        return this._userService.studyUsers.pipe(
            map((studyUsers) => studyUsers.find((studyUser) => studyUser.studyId === this.study.id)),
            mergeMap((studyUser) => {
                studyUser.currentTaskIndex = ++this._currentTaskIndex;
                return this._userService.updateStudyUser(studyUser);
            }),
            take(1)
        );
    }

    private handleNext() {
        const totalTasks = this.study.tasks.length;
        // route to next task if there is still another task to go to
        if (this._currentTaskIndex < totalTasks) {
            this._routeToTask(this.currentStudyTask);
            return;
        } else {
            if (this._userService.isCrowdsourcedUser) {
                this._userService.markCompletion(this.study.id).subscribe(
                    (completionCode: string) => {
                        this._routeToFinalPage(completionCode);
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
