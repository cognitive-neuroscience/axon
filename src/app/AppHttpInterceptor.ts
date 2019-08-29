import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {

    /**
     * Creates an instance of AppHttpInterceptor
     *
     * @param {Router} router
     * @memberof AppHttpInterceptor
     */
    constructor(private router: Router) { }

    /**
     * Intercepts all HTTP requests to add headers, log requests and redirect to
     * logout page if user credentials are invalid
     *
     * @param {HttpRequest<any>} request
     * @param {HttpHandler} next
     * @returns {Observable<HttpEvent<any>>}
     * @memberof AppHttpInterceptor
     */
    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (localStorage.getItem('token')) {
            request = request.clone({
                setHeaders: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('token')
                },
            });
        } else {
            request = request.clone({
                setHeaders: {
                    "Content-Type": "application/json",
                },
            });
        }

        return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                console.log(`[${event.status}] ${event.statusText}\n${event.url.replace(/\?[\D\d\s]+/gi, "")}`);
            }
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                console.error(`[${err.status}] ${err.statusText}\n${err.url}\n${err.message}`);
                if ((err.status === 401) || (err.status === 403)) {
                    this.router.navigate(["/public/login"]);
                    localStorage.removeItem('token');
                }
            }
        }));
    }
}