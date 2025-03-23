import { Injectable, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SentryErrorHandler } from '@sentry/angular';
import { environment } from 'src/environments/environment';
import { TaskManagerService } from './services/task-manager.service';
import { UserStateService } from './services/user-state-service';
import { IErrorNavigationState } from './pages/error-page/error-page.component';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from './services/snackbar/snackbar.service';

@Injectable()
export default class CustomErrorHandler extends SentryErrorHandler {
    constructor(
        private _router: Router,
        private taskManager: TaskManagerService,
        private userStateService: UserStateService,
        private injector: Injector,
        private snackbarService: SnackbarService
    ) {
        super();
    }

    handleError(error: string | Error | HttpErrorResponse): void {
        const ngZone = this.injector.get(NgZone);

        // check specifically to see if the CSRF is not responding...usually this means the server is offline
        if (error instanceof HttpErrorResponse && error?.url?.includes('/api/auth/csrf') && error?.status === 504) {
            this.snackbarService.openErrorSnackbar(
                'The server is not responding. Please try again later.',
                undefined,
                10000
            );
            ngZone.run(() => {
                this._router.navigate(['task-error'], {
                    state: {
                        taskIndex: undefined,
                        studyId: undefined,
                        stackTrace: error.message,
                        userId: this.userStateService.currentlyLoggedInUserId,
                    } as IErrorNavigationState,
                });
            });
        } else {
            ngZone.run(() => {
                this._router.navigate(['task-error'], {
                    state: {
                        taskIndex: this.taskManager?.currentStudyTask?.taskOrder,
                        studyId: this.taskManager?.currentStudyTask?.studyId,
                        stackTrace: error instanceof Error ? error.stack : error,
                        userId: this.userStateService.currentlyLoggedInUserId,
                    } as IErrorNavigationState,
                });
            });
        }

        if (environment.production) {
            super.handleError(error);
        }
    }
}
