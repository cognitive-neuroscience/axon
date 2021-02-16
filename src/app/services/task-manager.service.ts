import { HostListener, Injectable } from "@angular/core";
import { Experiment } from '../models/Experiment';
import { ExperimentsService } from './experiments.service';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { SessionStorageService } from './sessionStorage.service';
import { RouteMap } from '../routing/routes';
import { take } from "rxjs/operators";
import { hasSurveyMonkeyQuestionnaire } from "../common/commonMethods";
import { Questionnaire } from "../models/Questionnaire";

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

    private _routeToTask(task: string) {
        if(hasSurveyMonkeyQuestionnaire(task)) {
            const questionnaire = task.split("-")[0];
            const id = task.split("-")[1];
            const URL = this.getExperimentQuestionnaires().find(q => q.questionnaireID == id)?.url;
            if(!URL || !questionnaire || !id) {
                this.handleErr();
                return;
            }
            this._router.navigate([RouteMap[questionnaire].route, {link: URL}])
        } else {
            const route = RouteMap[task].route;
            if(!route) {
                this.handleErr();
                return;
            }
            this._router.navigate([route])
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

    getExperimentQuestionnaires(): Questionnaire[] {
        return this._experiment?.questionnaires ?? null;
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