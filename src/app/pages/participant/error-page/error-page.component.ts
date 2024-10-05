import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../../services/sessionStorage.service';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';

export interface IErrorNavigationState {
    studyId?: number;
    taskIndex?: number;
    stackTrace?: string;
    userId?: string;
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
        this.copyableErrString = `User ID: ${params?.userId}\nStudy ID: ${params.studyId}\nTask Index: ${params.taskIndex}\n\n${params.stackTrace}`;
        this.copyableErrString = this.copyableErrString.trim();
    }

    copyableErrString: string = '';

    ngOnInit(): void {}
}
