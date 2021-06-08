import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { RouteNames } from "../models/enums";
import { SnackbarService } from "../services/snackbar.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private snackbarService: SnackbarService, private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    this.snackbarService.openInfoSnackbar("Please login again to continue");
                    this.router.navigate([`/${RouteNames.LANDINGPAGE_LOGIN_SUBROUTE}`]);
                }
                return throwError(err.error);
            })
        );
    }
}
