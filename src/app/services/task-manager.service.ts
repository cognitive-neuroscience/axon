import { Injectable } from "@angular/core";
import { Experiment } from '../models/Experiment';
import { ExperimentsService } from './experiments.service';
import { Task } from '../models/Task';
import { TasklistService } from './tasklist.service';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { SessionStorageService } from './sessionStorage.service';
import { ConsentService } from './consentService';
import { ConfirmationService } from './confirmation.service';
import { RouteMap } from '../routing/routes';
import { switchMap, take } from "rxjs/operators";
import { of, Subscription } from 'rxjs';

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

    handleErr(): void {
        this._sessionStorageService.clearSessionStorage()
        this._router.navigate(['/login/onlineparticipant'])
        this._snackbarService.openErrorSnackbar("There was an error. Please contact the sharplab")
    }

    private _routeToTask(task: string) {
        const route = RouteMap[task].route;
        if(!route) {
            this._snackbarService.openErrorSnackbar("There was an error, please try again later.")
        } else {
            this._router.navigate([route])
            this._snackbarService.openSuccessSnackbar("Redirecting you to task number " + (this._currentTaskIndex + 1))
        }
    }

    private _routeToFinalPage(): void {
        this._router.navigate(['/complete'])
    }

    getExperimentCode(): string {
        const token = this._sessionStorageService.getExperimentCodeFromSessionStorage()
        return token ? token : ""
    }

    next(): void {
        const totalTasks = this._experiment.tasks.length
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