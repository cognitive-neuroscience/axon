import { Component, OnInit } from '@angular/core';
import { SnackbarService } from '../../../services/snackbar.service';
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { TaskManagerService } from '../../../services/task-manager.service';
import { AuthService } from '../../../services/auth.service';

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
    private _authService: AuthService
  ) { }

  shouldShowCopiedMessage: boolean = false
  completionCode: string = ""

  ngOnInit(): void {
    const experimentCode = this._taskManager.getExperimentCode()
    const userID = this._authService.getDecodedToken().UserID
    
    this.getCompletionCode(userID, experimentCode)
  }

  getCompletionCode(userId: string, expCode: string) {
    this._userService.getCompletionCode(userId, expCode).subscribe((completionCode) => {
      this.completionCode = completionCode
    })
  }

  showCopiedMessage() {
    this._snackbar.openSuccessSnackbar("Copied to clipboard!")
  }

}
