import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogMessage } from '../../models/InternalDTOs';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogMessage,
        private dialog: MatDialogRef<ConfirmationComponent>
    ) {}

    ngOnInit(): void {}

    onConfirm() {
        this.dialog.close(true);
    }

    onCancel() {
        this.dialog.close(false);
    }
}
