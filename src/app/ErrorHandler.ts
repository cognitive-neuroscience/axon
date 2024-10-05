import { ErrorHandler, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class CustomErrorHandler extends ErrorHandler {
    constructor(private _router: Router) {
        super();
    }

    handleError(error: any): void {
        alert(error);
    }

    // handleError(error) {
    //     const stringifiedError = typeof error === 'object' ? JSON.stringify(error) : error;
    //     alert(error);
    //     // this._router.navigate(['${}'], { state: { error: stringifiedError } });
    // }
}
