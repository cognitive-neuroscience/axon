import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { LocalStorageService } from './services/localStorage.service';

@Injectable()
export class JWTInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private localStorageService: LocalStorageService
    ) { }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.localStorageService.getItemFromLocalStorage("token")
        if (token) {
            const clonedReq = request.clone({
                headers: request.headers.set("Authorization", "Bearer " + token)
            })
            return next.handle(clonedReq).pipe(
                tap((event: HttpEvent<any>) => {
                    console.log(`${clonedReq.method}: ${clonedReq.url}`);
                }, (err) => {
                    console.error(err) 
                })
            )
        } else {
            console.error("No token")
            return next.handle(request)
        }
    }
}