import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RouteNames } from '../models/enums';
import { SnackbarService } from '../services/snackbar/snackbar.service';
import { ClearanceService } from '../services/clearance.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private snackbarService: SnackbarService,
        private router: Router,
        private clearanceService: ClearanceService
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    // Check if this is a password incorrect error that should be handled locally
                    const errorMessage = err.error?.message || err.message || '';
                    const isPasswordIncorrect = errorMessage.toLowerCase().includes('password is incorrect');

                    if (isPasswordIncorrect) {
                        // Let the login component handle the password incorrect error locally
                        return throwError(err);
                    }

                    // JWT has expired - log the user out and redirect to login
                    this.snackbarService.openInfoSnackbar('Your session has expired. Please login again to continue.');

                    // Clear all cached data and session storage
                    this.clearanceService.clearServices();

                    // Redirect to login page
                    this.router.navigate([`/${RouteNames.LANDINGPAGE_LOGIN_BASEROUTE}`]);

                    // do not propagate the error to the next interceptor
                    return EMPTY;
                }
                return throwError(err);
            })
        );
    }
}
