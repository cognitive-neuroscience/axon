import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { SnackbarData, SnackbarType } from '../models/InternalDTOs';
import { SnackbarComponent } from './snackbar/snackbar.component';

@Injectable({
    providedIn: "root"
})
export class SnackbarService {

    constructor(private _snackbar: MatSnackBar) {}

    public openInfoSnackbar(message: string, action?: string, duration?: number, verticalPos?: 'center') {
        let panelClasses = ["snack-bar-info"]
        if(verticalPos && verticalPos === 'center') {
            panelClasses.push("center-snackbar");
        }

        this.openSnackbar(
            new SnackbarData(message, action, SnackbarType.INFO),
            panelClasses,
            duration
        )
    }

    public clearSnackbar() {
        this._snackbar.dismiss();
    }

    // action doesn't do anything right now, kept in case we want to implement later
    public openSuccessSnackbar(message: string, action?: string, duration?: number, verticalPos?: 'center') {
        let panelClasses = ["snack-bar-success"]
        if(verticalPos && verticalPos === 'center') {
            panelClasses.push("center-snackbar");
        }

        this.openSnackbar(
            new SnackbarData(message, action, SnackbarType.SUCCESS),
            panelClasses,
            duration
        )
    }

    // action doesn't do anything right now, kept in case we want to implement later
    public openErrorSnackbar(message: string, action?: string, duration?: number, verticalPos?: 'center') {
        let panelClasses = ["snack-bar-error"]
        if(verticalPos && verticalPos === 'center') {
            panelClasses.push("center-snackbar");
        }

        this.openSnackbar(
            new SnackbarData(message, action, SnackbarType.ERROR),
            panelClasses,
            duration
        )
    }

    private openSnackbar(data: SnackbarData, panelClasses: string[], duration: number = 4000, verticalPos: MatSnackBarVerticalPosition = 'bottom', horizontalPos: MatSnackBarHorizontalPosition = 'center'): void {
        this._snackbar.openFromComponent(SnackbarComponent, {
            data: data,
            panelClass: panelClasses,
            duration: duration,
            verticalPosition: verticalPos,
            horizontalPosition: horizontalPos
        })
    }

}