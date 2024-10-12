import { Injectable, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SentryErrorHandler } from '@sentry/angular';
import { environment } from 'src/environments/environment';
import { TaskManagerService } from './services/task-manager.service';
import { UserStateService } from './services/user-state-service';
import { IErrorNavigationState } from './pages/error-page/error-page.component';

@Injectable()
export default class CustomErrorHandler extends SentryErrorHandler {
    constructor(
        private _router: Router,
        private taskManager: TaskManagerService,
        private userStateService: UserStateService,
        private injector: Injector
    ) {
        super();
    }

    handleError(error: string | Error): void {
        const ngZone = this.injector.get(NgZone);
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

        if (environment.production) {
            super.handleError(error);
        }
    }
}
