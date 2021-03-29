import { Injectable } from "@angular/core";
import { Experiment } from '../models/Experiment';
import { ExperimentsService } from './experiments.service';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { SessionStorageService } from './sessionStorage.service';
import { RouteMap } from '../routing/routes';
import { take } from "rxjs/operators";
import { isConsent, isCustomTask, isSurveyMonkeyQuestionnaire } from "../common/commonMethods";
import { EmbeddedPageData, TaskType } from "../models/InternalDTOs";

@Injectable({
    providedIn: "root"
})
export class TaskManagerService {
    /**
     * This service is in charge of handling routing of the participant to the tasks assigned 
     */
    
    private _currentTaskIndex: number = 0;
    private _experiment: Experiment = null;

    constructor(
        private _experimentService: ExperimentsService,
        private _snackbarService: SnackbarService,
        private _router: Router,
        private _userService: UserService,
        private _authService: AuthService,
        private _sessionStorageService: SessionStorageService,
    ) {}

    // 1. call startExperiment, which gets experiment from backend DB and extracts tasks
    // 2. keep track of task number and route user to task
    // 3. when finished, the task will call taskFinished and we increment the task number
    // 4. repeat until we are out of tasks. Display completion code

    startExperiment(): void {
        const code = this._sessionStorageService.getExperimentCodeFromSessionStorage()
        if(!code) {
            this.handleErr()
            return;
        }
        this._experimentService.getExperiment(code).pipe(take(1)).subscribe(experiment => {
            // keep experiment in local memory to ensure participant does not refresh
            this._experiment = experiment
            this.next();
            return;
        }, err => {
            console.error(err)
            this.handleErr()
            return;
        })
    }

    // only use to force the experiment to break
    clear() {
        this._experiment = null;
        this._currentTaskIndex = 0;
    }

    handleErr(): void {
        this._sessionStorageService.clearSessionStorage()
        this._router.navigate(['/login/onlineparticipant'])
        this._snackbarService.openErrorSnackbar("There was an error. Please contact the sharplab")
    }

    // ------------------------------------

    private _routeToTask(task: string) {
        if(isSurveyMonkeyQuestionnaire(task)) {
            // if task is of type survey monkey questionnaire
            const id = task.split("-")[1];
            if(!id) {
                this.handleErr();
                return;
            }
            const data: EmbeddedPageData = {
                ID: id,
                taskType: TaskType.Questionnaire
            }
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this._router.navigate([RouteMap.surveymonkeyquestionnaire.route], { state: data })
            })
        } else if(isCustomTask(task)) {
            // if task is a custom task
            const id = task.split("-")[1];
            if(!id) {
                this.handleErr();
                return;
            }
            const data: EmbeddedPageData = {
                ID: id,
                taskType: TaskType.CustomTask
            }
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this._router.navigate([RouteMap.pavloviatask.route], { state: data })
            })
        } else if(isConsent(task)) {
            const data: EmbeddedPageData = {
                taskType: TaskType.Questionnaire,
                ID: task
            }
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this._router.navigate([RouteMap[task].route], { state: data })
            })
        } else {
            // if task is a normal hard coded task
            const route = RouteMap[task].route;
            if(!route) {
                this.handleErr();
                return;
            }
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this._router.navigate([route])
            })
        }
        this._snackbarService.openSuccessSnackbar("Redirecting you to the next step")
    }

    private _routeToFinalPage(): void {
        this._router.navigate(['/complete'])
    }

    getExperimentCode(): string {
        const token = this._sessionStorageService.getExperimentCodeFromSessionStorage()
        return token ? token : ""
    }

    next(): void {
        if(!this.hasExperiment()) {
            this.handleErr();
            return;
        }
        const totalTasks = this._experiment.tasks.length;
        // route to next task if there is still another task to go to
        if(this._currentTaskIndex < totalTasks) {
            this._routeToTask(this._experiment.tasks[this._currentTaskIndex])
            this._currentTaskIndex++;
            return;
        } else {
            const userID = this._authService.getDecodedToken().UserID
            const experimentCode = this._sessionStorageService.getExperimentCodeFromSessionStorage()
            this._userService.markUserAsComplete(userID, experimentCode).pipe(take(1)).subscribe(() => {
                this._routeToFinalPage()
                return;
            }, err => {
                this.handleErr()
                return
            })
        }
    }

    hasExperiment(): boolean {
        return this._experiment ? true : false
    }
}