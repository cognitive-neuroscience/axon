import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpStatus } from 'src/app/models/Auth';
import { Role } from 'src/app/models/enums';
import { User } from 'src/app/models/User';
import { ConfirmationService } from 'src/app/services/confirmation/confirmation.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { CreateUserDialogComponent } from './create-user-dialog/create-user-dialog.component';

@Component({
    selector: 'app-manage-users',
    templateUrl: './manage-users.component.html',
    styleUrls: ['./manage-users.component.scss'],
})
export class ManageUsersComponent implements OnInit, OnDestroy {
    constructor(
        private userService: UserService,
        private dialog: MatDialog,
        private snackbarService: SnackbarService,
        private confirmationService: ConfirmationService,
        private loaderService: LoaderService
    ) {}

    get guests(): User[] {
        return this.userService.usersValue.filter((x) => x.role === Role.GUEST);
    }
    get organizationMembers(): User[] {
        return this.userService.usersValue.filter((x) => x.role === Role.ORGANIZATION_MEMBER);
    }

    subscriptions: Subscription[] = [];
    displayedColumnsForOrgMembers = ['id', 'name', 'email'];
    displayedColumnsForGuests = ['email', 'password', 'action'];

    ngOnInit(): void {
        const sub = this.userService.getOrUpdateUsers().subscribe(() => {});
        this.subscriptions.push(sub);
    }

    openCreateGuestModal() {
        const dialogRef = this.dialog.open(CreateUserDialogComponent, { width: '30%' });
        this.subscriptions.push(
            dialogRef.afterClosed().subscribe((data: User) => {
                if (data) this._createUser(data);
            })
        );
    }

    private _createUser(user: User) {
        this.loaderService.showLoader();
        const sub = this.userService.createUser(user).subscribe(
            (_data) => {
                this.loaderService.hideLoader();
                // this.userService.updateGuests();
                this.snackbarService.openSuccessSnackbar('Successfully created new guest');
            },
            (err: HttpStatus) => {
                this.loaderService.hideLoader();
                switch (err.status) {
                    case 409:
                        this.snackbarService.openErrorSnackbar(
                            'A user with this email already exists. Please contact the developer.'
                        );
                        break;
                    default:
                        this.snackbarService.openErrorSnackbar(err.message);
                        break;
                }
            }
        );
        this.subscriptions.push(sub);
    }

    deleteGuest(guest: User) {
        this.subscriptions.push(
            this.confirmationService
                .openConfirmationDialog('Are you sure you want to delete the guest: ' + guest.email + '?')
                .pipe(
                    mergeMap((ok) => {
                        this.loaderService.showLoader();
                        return ok ? this.userService.deleteGuest(guest) : of(false);
                    })
                )
                .subscribe(
                    (data) => {
                        this.loaderService.hideLoader();
                        if (data) {
                            this.snackbarService.openSuccessSnackbar('Successfully deleted ' + guest.email);
                        }
                    },
                    (err) => {
                        this.loaderService.hideLoader();
                        this.snackbarService.openErrorSnackbar(err.error.message || err.message);
                    }
                )
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
