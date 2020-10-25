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

    constructor(
        private _experimentService: ExperimentsService,
        private _tasklistService: TasklistService,
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
        if(!code) this.handleErr()
        this._experimentService.getExperiment(code).subscribe(experiment => {
            this._experiment = experiment
            this.getConsent()
        }, err => {
            console.error(err)
            this.handleErr()
        })
    }

    private getConsent() {
        this._router.navigate(['/consent'])
        this._consentService.consentSubject.subscribe(accepted => {
            if(accepted) {
                this.showMturkQuestionnaire()
            } else {
                const msg = "Are you sure you want to quit? You will not be able to register again."
                this._confirmationService.openConfirmationDialog(msg).subscribe(ok => {
                    if(ok) {
                        this._sessionStorageService.clearSessionStorage()
                        this._router.navigate(['/login/mturk'])
                        this._snackbarService.openInfoSnackbar("Experiment was cancelled.")
                    }
                })
            }
        })
    }

    private showMturkQuestionnaire() {
        this._router.navigate(['/questionnaire/mturk'])
    }

    handleErr() {
        this._sessionStorageService.clearSessionStorage()
        this._router.navigate(['/mturk/login'])
        this._snackbarService.openErrorSnackbar("There was an error. Please contact the sharplab")
    }

    private _routeToTask(task: Task) {
        this._tasklistService.taskRouteList.subscribe((taskRoutes) => {
            const route = taskRoutes.find(aRoute => aRoute.id === task.id)
            if(!route) {
                this._snackbarService.openErrorSnackbar("There was an error, please try again later.")
            }
            this._router.navigate([route.route])
            this._snackbarService.openSuccessSnackbar("Redirecting you to task " + (this._currentTaskIndex + 1))
        })
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
            this._userService.markUserAsComplete(userID, experimentCode).subscribe((data) => {
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