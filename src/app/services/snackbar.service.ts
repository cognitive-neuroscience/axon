import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarData, SnackbarType } from '../models/InternalDTOs';
import { SnackbarComponent } from './snackbar/snackbar.component';

@Injectable({
    providedIn: "root"
})
export class SnackbarService {

    private readonly defaultDuration = 4000

    constructor(private _snackbar: MatSnackBar) {}

    public openInfoSnackbar(message: string, action?: string, duration?: number) {
        this._snackbar.openFromComponent(SnackbarComponent, {
            data: new SnackbarData(message, action, SnackbarType.INFO),
            panelClass: ["snack-bar-info"],
            duration: duration ? duration : this.defaultDuration
        })
    }

    // action doesn't do anything right now, kept in case we want to implement later
    public openSuccessSnackbar(message: string, action?: string, duration?: number) {
        this._snackbar.openFromComponent(SnackbarComponent, {
            data: new SnackbarData(message, action, SnackbarType.SUCCESS),
            panelClass: ["snack-bar-success"],
            duration: duration ? duration : this.defaultDuration
        })
    }
    // action doesn't do anything right now, kept in case we want to implement later
    public openErrorSnackbar(message: string, action?: string, duration?: number) {
        this._snackbar.openFromComponent(SnackbarComponent, {
            data: new SnackbarData(message, action, SnackbarType.ERROR),
            panelClass: ["snack-bar-error"],
            duration: duration ? duration : this.defaultDuration
        })
    }

}