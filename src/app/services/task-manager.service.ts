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
import { EMPTY, of, Subscription } from 'rxjs';

@Injectable({
    providedIn: "root"
})
export class TaskManagerService {
    /**
     * This service is in charge of handling routing of the participant to the tasks assigned 
     */
    
    private _currentTaskIndex: number = 0;
    private _experiment: Experiment = null;
    private _totalAmountEarned: number = 0;
    private _subscriptions: Subscription[] = [];

    constructor(
        private _experimentService: ExperimentsService,
        private _snackbarService: SnackbarService,
        private _router: Router,
        private _userService: UserService,
        private _authService: AuthService,
        private _sessionStorageService: SessionStorageService,
        private _consentService: ConsentService,
        private _confirmationService: ConfirmationService
    ) {}

    // 1. call startExperiment, which gets experiment from backend DB and extracts tasks
    // 2. keep track of task number and route user to task
    // 3. when finished, the task will call taskFinished and we increment the task number
    // 4. repeat until we are out of tasks. Display completion code

    startExperiment() {
        const code = this._sessionStorageService.getExperimentCodeFromSessionStorage()
        if(!code) {
            this.handleErr()
            return
        }
        this._experimentService.getExperiment(code).pipe(take(1)).subscribe(experiment => {
            // keep experiment in local memory to ensure participant does not refresh
            this._experiment = experiment
            this.getConsent()
        }, err => {
            console.error(err)
            this.handleErr()
        })
    }

    private getConsent() {
        this._router.navigate(['/consent']).then(() => {
            this._subscriptions.push(
                this._consentService.consentSubject.pipe(switchMap(accepted => {
                    if(accepted) {
                        this.showDemographicsQuestionnaire()
                        return of(false);
                    } else {
                        const msg = "Are you sure you want to quit? You will not be able to register again."
                        // inner subscription is automatically unsubscribed by switchMap
                        return this._confirmationService.openConfirmationDialog(msg)
                    }
                })).subscribe(ok => {
                    if(ok) {
                        this._sessionStorageService.clearSessionStorage()
                        this._router.navigate(['/login/mturk'])
                        this._snackbarService.openInfoSnackbar("Experiment was cancelled.")
                    }
                })
            )
        })
    }

    private showDemographicsQuestionnaire() {
        // clear subscriptions for consentSubject
        this._subscriptions.forEach(sub => sub.unsubscribe());
        this._router.navigate(['/questionnaire/demographics'])
    }

    handleErr() {
        this._sessionStorageService.clearSessionStorage()
        this._router.navigate(['/mturk/login'])
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

    private _routeToFinalPage() {
        this._router.navigate(['/complete'])
    }

    getExperimentCode() {
        const token = this._sessionStorageService.getExperimentCodeFromSessionStorage()
        return token ? token : ""
    }

    nextExperiment() {
        const totalTasks = this._experiment.tasks.length
        // route to next task if there is still another task to go to
        if(this._currentTaskIndex < totalTasks) {
            this._routeToTask(this._experiment.tasks[this._currentTaskIndex])
            this._currentTaskIndex++;
        } else {
            const jwt = this._authService.getDecodedToken()
            const userID = jwt ? jwt.UserID : ""
            const experimentCode = this._sessionStorageService.getExperimentCodeFromSessionStorage()
            this._userService.markUserAsComplete(userID, experimentCode).pipe(take(1)).subscribe((data) => {
                this._routeToFinalPage()
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