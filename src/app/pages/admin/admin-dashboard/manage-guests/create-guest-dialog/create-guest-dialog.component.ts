import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Role, SupportedLangs } from 'src/app/models/enums';
import { User } from 'src/app/models/Login';

@Component({
    selector: 'app-create-guest-dialog',
    templateUrl: './create-guest-dialog.component.html',
    styleUrls: ['./create-guest-dialog.component.scss'],
})
export class CreateGuestDialogComponent implements OnInit {
    constructor(private dialogRef: MatDialogRef<CreateGuestDialogComponent>) {}

    newUserEmail: string = '';

    ngOnInit(): void {}

    isValid() {
        return this.newUserEmail && this.validateEmail(this.newUserEmail);
    }

    private validateEmail(email): boolean {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    sendDataToParent() {
        const user: User = {
            id: null,
            createdAt: null,
            email: this.newUserEmail,
            role: Role.GUEST,
            changePasswordRequired: false,
            lang: SupportedLangs.NONE,
        };
        this.dialogRef.close(user);
    }
}
