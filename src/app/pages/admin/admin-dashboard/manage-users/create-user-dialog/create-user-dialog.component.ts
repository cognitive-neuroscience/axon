import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Role, SupportedLangs } from 'src/app/models/enums';
import { User } from 'src/app/models/User';
import { UserStateService } from 'src/app/services/user-state-service';

@Component({
    selector: 'app-create-user-dialog',
    templateUrl: './create-user-dialog.component.html',
    styleUrls: ['./create-user-dialog.component.scss'],
})
export class CreateUserDialogComponent implements OnInit {
    constructor(
        private dialogRef: MatDialogRef<CreateUserDialogComponent>,
        private userStateService: UserStateService
    ) {}

    newUserEmail: string = '';
    newUserRole: string = '';
    newUserName: string = '';

    ngOnInit(): void {}

    isValid() {
        return this.newUserEmail && this.newUserRole && this.newUserName && this.validateEmail(this.newUserEmail);
    }

    private validateEmail(email: string): boolean {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    sendDataToParent() {
        const user: User = {
            id: null,
            name: this.newUserName,
            createdAt: null,
            email: this.newUserEmail,
            role: this.newUserRole === Role.ORGANIZATION_MEMBER ? Role.ORGANIZATION_MEMBER : Role.GUEST,
            changePasswordRequired: false,
            password: 'password',
            lang: SupportedLangs.EN,
            organization: this.userStateService.userOrganization,
        };
        this.dialogRef.close(user);
    }
}
