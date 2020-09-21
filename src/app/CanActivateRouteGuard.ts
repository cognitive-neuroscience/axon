import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Role } from './models/InternalDTOs';
import { AuthService } from './services/auth.service';
import { LocalStorageService } from './services/localStorage.service';

@Injectable({
    providedIn: "root"
})
export class CanActivateRouteGuard implements CanActivate {

    constructor(private authService: AuthService, private localStorageService: LocalStorageService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

        const token = this.localStorageService.getTokenFromLocalStorage()

        if(token) {
            const jwt = this.authService.decodeToken(token)
            if(route.data.roles && route.data.roles.indexOf(jwt.Role.toUpperCase()) === -1) {
                this.localStorageService.clearLocalStorage()
                this.router.navigate(['/login'])
                return false
            }
            return true
        }
        return false
    }
}