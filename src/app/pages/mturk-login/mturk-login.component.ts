import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SnackbarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';
import { TaskManagerService } from '../../services/task-manager.service';
import { SessionStorageService } from '../../services/sessionStorage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mturk-login',
  templateUrl: './mturk-login.component.html',
  styleUrls: ['./mturk-login.component.scss']
})
export class MturkLoginComponent implements OnInit, OnDestroy {

  workerId: string = "";
  experimentCode: string = "";
  urlContainsCode: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(
    private _route: ActivatedRoute, 
    private _snackbarService: SnackbarService,
    private _authService: AuthService,
    private _taskManager: TaskManagerService,
    private _sessionStorageService: SessionStorageService
  ) { }

  ngOnInit(): void {
    this._getQueryParams()
  }

  // If the url contains an experiment shortcode then we get it here.
  // Otherwise the user will be prompted to enter their own shortcode.
  private _getQueryParams() {
    this.subscriptions.push(
      this._route.queryParams.subscribe(params => {
        const urlCode = params['code']
        if(urlCode) {
          this.urlContainsCode = true
          this.experimentCode = urlCode;
        }
      })
    )
  }

  onRegister() {
    // sets JWT and records worker in DB
    this._authService.loginTurker(this.workerId, this.experimentCode).subscribe((response) => {
      this._snackbarService.openSuccessSnackbar("Registered: " + this.workerId)
      if (response.headers.get('Authorization')) {
        const tokenString = response.headers.get("Authorization").split(" ")[1]
        this._sessionStorageService.setTokenInSessionStorage(tokenString)
        this._sessionStorageService.setExperimentCodeInSessionStorage(this.experimentCode)
      }
      this._taskManager.startExperiment()
    }, (err) => {
      // if headers too large error
      if(err.status && err.status === 431) {
        this._snackbarService.openErrorSnackbar('There was an error. Please try clearing your cookies, or open the experiment in incognito mode.', '', 6000)
      } else {
        this._snackbarService.openErrorSnackbar(err.error.message)
      }
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
