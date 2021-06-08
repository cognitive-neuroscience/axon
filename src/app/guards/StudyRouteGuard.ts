import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from "@angular/router";
import { Observable } from "rxjs";
import { TaskManagerService } from "../services/task-manager.service";
import { SnackbarService } from "../services/snackbar.service";
import { SessionStorageService } from "../services/sessionStorage.service";
import { AuthService } from "../services/auth.service";
import { Role } from "../models/enums";
@Injectable({
    providedIn: "root",
})
export class StudyRouteGuard implements CanActivate {
    /**
     * This route guard checks that the user EITHER has the study in local memory, or is an admin in which
     * case the study is allowed to proceed
     */

    constructor(
        private _taskManager: TaskManagerService,
        private _router: Router,
        private _snackbarService: SnackbarService,
        private _sessionStorage: SessionStorageService,
        private _authService: AuthService
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const decodedToken = this._authService.getDecodedToken();

        if (decodedToken && (this.hasStudy() || this.nonParticipantsAllowed(decodedToken.Role))) {
            return true;
        } else {
            this._router.navigate(["/crowdsource-participant"]);
            this._sessionStorage.clearSessionStorage();
            console.error("The page was refreshed or access is forbidden");
            this._snackbarService.openErrorSnackbar("There was an error", "", 5000);
            return false;
        }
    }
    // checks to see if an study is loaded in memory. If not, the user has probably refreshed the page
    hasStudy() {
        return this._taskManager.hasStudy();
    }

    nonParticipantsAllowed(role: Role): boolean {
        const allowedRoles = [Role.ADMIN, Role.GUEST];
        return allowedRoles.includes(role);
    }
}
