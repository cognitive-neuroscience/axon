import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../../services/sessionStorage.service';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';

export interface IErrorNavigationState {
    studyId?: string;
    taskIndex?: number;
    error?: string;
    stackTrace?: string;
}

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.component.html',
    styleUrls: ['./error-page.component.scss', '../final-page/final-page.component.scss'],
})
export class ErrorPageComponent implements OnInit {
    constructor(
        private _snackbar: SnackbarService,
        private _router: Router,
        private _sessionStorage: SessionStorageService
    ) {
        const params = this._router.getCurrentNavigation()?.extras?.state as IErrorNavigationState;

        this.studyId = params?.studyId;
        this.taskIndex = params?.taskIndex;
        this.error = params?.error;
        this.stackTrace = params?.stackTrace;
    }

    studyId: string = '';
    taskIndex: number = 0;
    error: string = '';
    stackTrace: string = '';

    ngOnInit(): void {}
}
