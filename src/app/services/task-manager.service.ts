import { Injectable } from "@angular/core";
import { Study } from "../models/Study";
import { StudyService } from "./study.service";
import { SnackbarService } from "./snackbar.service";
import { Router } from "@angular/router";
import { UserService } from "./user.service";
import { AuthService } from "./auth.service";
import { SessionStorageService } from "./sessionStorage.service";
import { take } from "rxjs/operators";
import { isConsent, isCustomTask, isSurveyMonkeyQuestionnaire } from "../common/commonMethods";
import { EmbeddedPageData } from "../models/InternalDTOs";
import { Platform, TaskType } from "../models/enums";
import { BehaviorSubject } from "rxjs";
import { StudyTask } from "../models/Task";
import { HttpClient } from "@angular/common/http";
import { TaskService } from "./task.service";
import { TaskNames } from "../models/TaskData";

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

    constructor(
        private _studyService: StudyService,
        private _snackbarService: SnackbarService,
        private _router: Router,
        private _userService: UserService,
        private _authService: AuthService,
        private _sessionStorageService: SessionStorageService,
        private _taskService: TaskService
    ) {}

    // 1. call startStudy, which gets study from backend DB and extracts tasks
    // 2. keep track of task number and route user to task
    // 3. when finished, the task will call taskFinished and we increment the task number
    // 4. repeat until we are out of tasks. Display completion code

    startStudy(): void {
        const code = this._sessionStorageService.getStudyCodeFromSessionStorage();
        if (!code) {
            this.handleErr();
            return;
        }

        this._studyService
            .getStudyByStudyCode(code)
            .pipe(take(1))
            .subscribe(
                (study) => {
                    // keep study in local memory to ensure participant does not refresh
                    this._study = study;
                    this.next();
                    return;
                },
                (err) => {
                    console.error(err);
                    this.handleErr();
                    return;
                }
            );
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
            // render questionnaire
        } else if (studyTask.task.taskType === TaskType.EXPERIMENTAL || studyTask.task.taskType === TaskType.NAB) {
        }
        // if (isSurveyMonkeyQuestionnaire(task)) {
        //     // if task is of type survey monkey questionnaire
        //     const id = task.split("-")[1];
        //     if (!id) {
        //         this.handleErr();
        //         return;
        //     }
        //     const data: EmbeddedPageData = {
        //         ID: id,
        //         taskType: TaskType.QUESTIONNAIRE,
        //     };
        //     this._router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        //         // this._router.navigate([RouteMap.surveymonkeyquestionnaire.route], { state: data });
        //     });
        // } else if (isCustomTask(task)) {
        //     // if task is a custom task
        //     const id = task.split("-")[1];
        //     if (!id) {
        //         this.handleErr();
        //         return;
        //     }
        //     // const data: EmbeddedPageData = {
        //     //     ID: id,
        //     //     taskType: TaskType.,
        //     // };
        //     this._router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        //         // this._router.navigate([RouteMap.pavloviatask.route], { state: data });
        //     });
        // } else if (isConsent(task)) {
        //     // const data: EmbeddedPageData = {
        //     //     // taskType: TaskType.Questionnaire,
        //     //     ID: task,
        //     // };
        //     this._router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        //         // this._router.navigate([RouteMap[task].route], { state: data });
        //     });
        // } else {
        //     // if task is a normal hard coded task
        //     // const route = RouteMap[task].route;
        //     // if (!route) {
        //     //     this.handleErr();
        //     //     return;
        //     // }
        //     this._router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        //         // this._router.navigate([route]);
        //     });
        // }
        // this._snackbarService.openSuccessSnackbar("Redirecting you to the next step");
    }

    private _routeToFinalPage(): void {
        this._router.navigate(["/complete"]);
    }

    next(): void {
        if (!this.hasStudy()) {
            this.handleErr();
            return;
        }
        const totalTasks = this._study.tasks.length;
        // route to next task if there is still another task to go to
        if (this._currentTaskIndex < totalTasks) {
            this._routeToTask(this.currentStudyTask);
            this._currentTaskIndex++;
            return;
        } else {
            const userID = this._authService.getDecodedToken().UserID;
            const studyCode = this._sessionStorageService.getStudyCodeFromSessionStorage();
            this._userService
                .markUserAsComplete(userID, studyCode)
                .pipe(take(1))
                .subscribe(
                    () => {
                        this._routeToFinalPage();
                        return;
                    },
                    (err) => {
                        this.handleErr();
                        return;
                    }
                );
        }
    }

    hasStudy(): boolean {
        return this._study ? true : false;
    }
}
