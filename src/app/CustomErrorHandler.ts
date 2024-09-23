import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SentryErrorHandler } from '@sentry/angular';
import { environment } from 'src/environments/environment';

@Injectable()
export default class CustomErrorHandler extends SentryErrorHandler {
    constructor(private _router: Router) {
        super();
    }

    handleError(error: any): void {
        this._router.navigate(['/task-error']);
        if (environment.production) {
            super.handleError(error);
        }
    }
}
