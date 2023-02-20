import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { Role } from '../models/enums';
import { SnackbarService } from '../services/snackbar/snackbar.service';
import { UserStateService } from '../services/user-state-service';

@Injectable({
    providedIn: 'root',
})
export class CanActivateRouteGuard implements CanActivate {
    /**
     * For the admin route, this auth guard ensures that someone can only access if they have a valid token
     */
    constructor(private userStateService: UserStateService, private snackbarService: SnackbarService) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.userStateService.getOrUpdateUserState().pipe(
            map((user) => user?.role),
            map((userRole) => {
                if (!userRole) {
                    this.snackbarService.openErrorSnackbar('forbidden');
                    return false;
                } else {
                    const allowedRoles: Role[] | undefined = route?.data?.roles;
                    const isAllowed = allowedRoles.length === 0 || allowedRoles.includes(userRole);

                    if (!isAllowed) {
                        this.snackbarService.openErrorSnackbar('forbidden');
                    }

                    return isAllowed;
                }
            }),
            catchError((err) => {
                this.snackbarService.openErrorSnackbar('forbidden');
                return of(false);
            }),
            take(1)
        );
    }
}
