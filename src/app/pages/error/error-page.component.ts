import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.component.html',
    styleUrls: ['./error-page.component.scss', '../participant/final-page/final-page.component.scss'],
})
export class ErrorPageComponent implements OnInit {
    constructor(private _snackbar: SnackbarService, private _router: Router) {
        const params = this._router.getCurrentNavigation().extras.state as { error: string };
    }

    error: string = '';

    ngOnInit(): void {}

    handleCopy() {
        alert(`copied: ${this.error}`);
    }
}
