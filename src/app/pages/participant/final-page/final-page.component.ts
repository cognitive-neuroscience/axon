import { Component, OnInit } from '@angular/core';
import { SnackbarService } from '../../../services/snackbar.service';
import { UserService } from '../../../services/user.service';
import { TaskManagerService } from '../../../services/task-manager.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../../services/sessionStorage.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-final-page',
  templateUrl: './final-page.component.html',
  styleUrls: ['./final-page.component.scss']
})
export class FinalPageComponent implements OnInit {

  constructor(
    private _snackbar: SnackbarService, 
    private _userService: UserService, 
    private _taskManager: TaskManagerService, 
    private _authService: AuthService,
    private _router: Router,
    private _sessionStorage: SessionStorageService
  ) { }

  shouldShowCopiedMessage: boolean = false
  completionCode: string = ""

  ngOnInit(): void {
    const experimentCode = this._taskManager.getExperimentCode()
    const userID = this._authService.getDecodedToken().UserID
    
    this.getCompletionCode(userID, experimentCode)
  }

  getCompletionCode(userId: string, expCode: string) {
    if(userId && expCode) {
      this._userService.getCompletionCode(userId, expCode).pipe(take(1)).subscribe((completionCode) => {
        // user navigated to complete without finishing
        if(!completionCode) {
          this.handleErr()
        }
        this.completionCode = completionCode
      })
    }
  }

  handleErr() {
    this._sessionStorage.clearSessionStorage()
    this._snackbar.openErrorSnackbar("Tasks not complete")
    this._router.navigate(['/login/onlineparticipant'])
  }

  showCopiedMessage() {
    this._snackbar.openSuccessSnackbar("Copied to clipboard!")
  }

  logout() {
    this._sessionStorage.clearSessionStorage()
    this._router.navigate(['/login/onlineparticipant'])
    this._snackbar.openSuccessSnackbar("Thanks for taking part in our study! To finish, paste your completion code into the original site. You may close this page.", undefined, 10000, 'center');
  }

}
