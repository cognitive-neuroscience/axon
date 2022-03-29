import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
    selector: 'app-confirm-done-dialog',
    templateUrl: './confirm-done-dialog.component.html',
    styleUrls: ['./confirm-done-dialog.component.scss'],
})
export class ConfirmDoneDialogComponent implements OnInit {
    enteredWord: string = '';

    private readonly completionWord = 'BRAIN';

    constructor(
        private dialogRef: MatDialogRef<ConfirmDoneDialogComponent>,
        private snackbarService: SnackbarService
    ) {}

    onCancel() {
        this.dialogRef.close();
    }

    onConfirmWord() {
        if (this.enteredWord === this.completionWord) {
            this.dialogRef.close(true);
        } else {
            this.snackbarService.openInfoSnackbar(
                'Incorrect word entered. Please enter the word shown on the screen once you are done with the task'
            );
            this.dialogRef.close(false);
        }
    }

    ngOnInit(): void {}
}
