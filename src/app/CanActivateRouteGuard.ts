import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { SessionStorageService } from './services/sessionStorage.service';

@Injectable({
    providedIn: "root"
})
export class CanActivateRouteGuard implements CanActivate {

    constructor(private authService: AuthService, private sessionStorageService: SessionStorageService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const token = this.sessionStorageService.getTokenFromSessionStorage()

        if(token) {
            const jwt = this.authService.getDecodedToken()
            if(route.data.roles && route.data.roles.indexOf(jwt.Role.toUpperCase()) === -1) {
                console.log("rerouting to false");
                
                this.sessionStorageService.clearSessionStorage()
                this.router.navigate(['/login'])
                return false
            }
            return true
        }
        this.router.navigate(['/login'])
        return false
    }
}