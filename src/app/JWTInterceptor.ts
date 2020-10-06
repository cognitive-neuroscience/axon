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
import { SessionStorageService } from './services/sessionStorage.service';

@Injectable()
export class JWTInterceptor implements HttpInterceptor {

    constructor(
        private sessionStorageService: SessionStorageService
    ) { }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.sessionStorageService.getTokenFromSessionStorage()
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
            return next.handle(request)
        }
    }
}