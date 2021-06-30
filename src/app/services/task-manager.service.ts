import { Injectable } from "@angular/core";
import { Study } from "../models/Study";
import { StudyService } from "./study.service";
import { SnackbarService } from "./snackbar.service";
import { Router } from "@angular/router";
import { UserService } from "./user.service";
import { SessionStorageService } from "./sessionStorage.service";
import { take } from "rxjs/operators";
import { Platform, RouteNames, TaskType } from "../models/enums";
import { StudyTask } from "../models/Task";
import { TaskPlayerNavigationConfig } from "../pages/tasks/playables/task-player/task-player.component";
import { QuestionnaireNavigationConfig } from "../pages/tasks/questionnaires/questionnaire-reader/questionnaire-reader.component";

@Injectable({
    providedIn: "root",
})
export class TaskManagerService {
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
        private _sessionStorageService: SessionStorageService
    ) {}

    // 1. call startStudy, which gets study from backend DB and extracts tasks
    // 2. keep track of task number and route user to task
    // 3. when finished, the task will call taskFinished and we increment the task number
    // 4. repeat until we are out of tasks. Display completion code

    configureStudy(studyId: number, currentIndex: number) {
        this._currentTaskIndex = currentIndex;
        this._studyService
            .getStudyById(studyId)
            .pipe(take(1))
            .subscribe(
                (study) => {
                    this._study = study;
                    if (!this._userService.userHasValue) this._userService.updateUser();
                    this.start(this.currentStudyTask);
                },
                (err) => {
                    this.handleErr();
                }
            );
    }

    start(studyTask: StudyTask) {
        this._routeToTask(studyTask);
    }

    // only use to force the study to break
    clear() {
        this._study = null;
        this._currentTaskIndex = 0;
    }

    handleErr(): void {
        this._sessionStorageService.clearSessionStorage();
        this._router.navigate(["crowdsource-participant"]);
        this._snackbarService.openErrorSnackbar("There was an error. Please contact the sharplab");
    }

    // ------------------------------------

    private _routeToTask(studyTask: StudyTask) {
        if (studyTask.task.fromPlatform === Platform.PAVLOVIA) {
            // handle embed
        } else if (studyTask.task.taskType === TaskType.QUESTIONNAIRE) {
            const config = Object.keys(studyTask.config).length === 0 ? studyTask.task.config : studyTask.config;
            const navigationConfig: QuestionnaireNavigationConfig = {
                metadata: config,
                mode: "actual",
            };
            this._router.navigate([`${RouteNames.QUESTIONNAIRE}`], { state: navigationConfig });
        } else if (studyTask.task.taskType === TaskType.EXPERIMENTAL || studyTask.task.taskType === TaskType.NAB) {
            const config = Object.keys(studyTask.config).length === 0 ? studyTask.task.config : studyTask.config;
            const navigationConfig: TaskPlayerNavigationConfig = {
                metadata: config,
                mode: "actual",
            };
            this._router.navigate([`${RouteNames.TASKPLAYER}`], { state: navigationConfig });
        }
    }

    private _routeToFinalPage(completionCode: string): void {
        this._router.navigate(["/complete"], { state: { completionCode: completionCode } });
    }

    next(): void {
        if (!this.hasStudy) {
            this.handleErr();
            return;
        }
        this._currentTaskIndex++;

        const totalTasks = this.study.tasks.length;
        // route to next task if there is still another task to go to
        if (this._currentTaskIndex < totalTasks) {
            this._routeToTask(this.currentStudyTask);
            return;
        } else {
            this._userService.markCompletion(this.study.id).subscribe(
                (completionCode: string) => {
                    this._routeToFinalPage(completionCode);
                },
                (err) => {
                    this.handleErr();
                }
            );
        }
    }
}
