import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarData } from '../models/InternalDTOs';
import { SnackbarComponent } from './snackbar/snackbar.component';

@Injectable({
    providedIn: "root"
})
export class SnackbarService {

    private readonly defaultDuration = 4000

    constructor(private _snackbar: MatSnackBar) {}

    public openSnackbar(message: string, action?: string, duration?: number) {
        this._snackbar.openFromComponent(SnackbarComponent, {
            data: new SnackbarData(message, action),
            duration: duration ? duration : this.defaultDuration
        })
    }

}