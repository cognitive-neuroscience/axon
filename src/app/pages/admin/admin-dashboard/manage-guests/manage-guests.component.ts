import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable, of, Subscription } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { User } from "src/app/models/Login";
import { ConfirmationService } from "src/app/services/confirmation.service";
import { LoaderService } from "src/app/services/loader.service";
import { SnackbarService } from "src/app/services/snackbar.service";
import { UserService } from "src/app/services/user.service";
import { CreateGuestDialogComponent } from "./create-guest-dialog/create-guest-dialog.component";

@Component({
    selector: "app-manage-guests",
    templateUrl: "./manage-guests.component.html",
    styleUrls: ["./manage-guests.component.scss"],
})
export class ManageGuestsComponent implements OnInit, OnDestroy {
    constructor(
        private userService: UserService,
        private dialog: MatDialog,
        private snackbarService: SnackbarService,
        private confirmationService: ConfirmationService,
        private loaderService: LoaderService
    ) {}

    guests: Observable<User[]>;

    subscriptions: Subscription[] = [];

    displayedColumnsForGuests = ["email", "password", "action"];

    ngOnInit(): void {
        this.guests = this.userService.guests;
        if (!this.userService.hasGuests) this.userService.updateGuests();
    }

    openCreateGuestModal() {
        const dialogRef = this.dialog.open(CreateGuestDialogComponent, { width: "30%" });
        this.subscriptions.push(
            dialogRef.afterClosed().subscribe((data: User) => {
                if (data) this._createGuest(data);
            })
        );
    }

    private _createGuest(user: User) {
        this.loaderService.showLoader();
        this.userService.createGuest(user.email, "guest").subscribe(
            (data) => {
                this.loaderService.hideLoader();
                this.userService.updateGuests();
                this.snackbarService.openSuccessSnackbar("Successfully created new guest");
            },
            (err: HttpErrorResponse) => {
                this.loaderService.hideLoader();
                let errMsg = err.error?.message;
                if (!errMsg) {
                    errMsg = "Could not create guest";
                }
                this.snackbarService.openErrorSnackbar(err.error?.message || err.message);
            }
        );
    }

    deleteGuest(guest: User) {
        this.subscriptions.push(
            this.confirmationService
                .openConfirmationDialog("Are you sure you want to delete the guest: " + guest.email + "?")
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
                            this.userService.updateGuests();
                            this.snackbarService.openSuccessSnackbar("Successfully deleted " + guest.email);
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
