import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { User } from 'src/app/models/Login';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { CreateGuestDialogComponent } from './create-guest-dialog/create-guest-dialog.component';

@Component({
  selector: 'app-manage-guests',
  templateUrl: './manage-guests.component.html',
  styleUrls: ['./manage-guests.component.scss']
})
export class ManageGuestsComponent implements OnInit, OnDestroy {

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private confirmationService: ConfirmationService
  ) { }

  guests: Observable<User[]>;

  subscriptions: Subscription[] = [];

  displayedColumnsForGuests = ['email', 'password', 'action'];

  ngOnInit(): void {
    this.guests = this.userService.guests;
    this.userService.update();
  }

  openCreateGuestModal() {
    const dialogRef = this.dialog.open(CreateGuestDialogComponent, {width: "30%"})
    this.subscriptions.push(
      dialogRef.afterClosed().subscribe((data: User) => {  
        if(data) this._createGuest(data);
      })
    )
  }

  private _createGuest(user: User) {
    this.userService.createGuest(user.email, "guest").subscribe((data) => {
      this.userService.update();
      this.snackbarService.openSuccessSnackbar("Successfully created new guest")
    }, (err: HttpErrorResponse) => {
      let errMsg = err.error?.message;
      if(!errMsg) {
        errMsg = "Could not create guest"
      }
      this.snackbarService.openErrorSnackbar(err.error?.message)
    })
  }

  deleteGuest(email: string) {
    this.confirmationService.openConfirmationDialog("Are you sure you want to delete the guest: " + email + "?").pipe(
      mergeMap(ok => {
        if(ok) {
          return this.userService.deleteUser(email)
        } else {
          return of(false)
        }
      })
    ).subscribe(data => {
      if(data) {
        this.userService.update()
        this.snackbarService.openSuccessSnackbar("Successfully deleted " + email)
      }
    }, err => {
      console.error(err)
      this.snackbarService.openErrorSnackbar("There was an error deleting the user")
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

}
