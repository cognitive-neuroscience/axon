import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TaskManagerService } from './services/task-manager.service';
import { SnackbarService } from './services/snackbar.service';
import { SessionStorageService } from './services/sessionStorage.service';
@Injectable({
    providedIn: "root"
})
export class ExperimentRouteGuard implements CanActivate {

    constructor(
        private _taskManager: TaskManagerService, 
        private _router: Router, 
        private _snackbarService: SnackbarService,
        private _sessionStorage: SessionStorageService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const token = this._sessionStorage.getTokenFromSessionStorage()
        if(token && this.hasExperiment()) {
            return true
        } else {
            this._router.navigate(['/mturk/login'])
            this._sessionStorage.clearSessionStorage()
            console.error("The page was refreshed or access is forbidden")
            this._snackbarService.openErrorSnackbar("There was an error", "", 5000)
            return false
        }
    }

    // checks to see if an experiment is loaded in memory. If not, the user has probably refreshed the page
    hasExperiment() {
        return this._taskManager.hasExperiment()
    }
    
}