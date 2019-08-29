import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginCredentials } from 'src/app/models/LoginCredentials';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginResponse } from 'src/app/models/LoginResponse';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {


  /**
   * Login Credentials
   *
   * @type {LoginCredentials}
   * @memberof LoginComponent
   */
  model: LoginCredentials = new LoginCredentials();


  /**
   * Login Subscription
   *
   * @type {Subscription}
   * @memberof LoginComponent
   */
  loginSubscription: Subscription = new Subscription();


  /**
   * Creates an instance of LoginComponent.
   * 
   * @param {AuthService} authService
   * @param {Router} router
   * @memberof LoginComponent
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  /**
   * Initiate a login request based on the entered credentials
   *
   * @memberof LoginComponent
   */
  proceed() {
    this.loginSubscription = this.authService.login(this.model).subscribe((response: LoginResponse) => {
      localStorage.setItem('token', response.token);
      this.router.navigate(['/dashboard']);
    }, (error: HttpErrorResponse) => {
      console.error(error);
    });
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }

}
