import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginCredentials } from 'src/app/models/LoginCredentials';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  mode = "login";
  model: LoginCredentials = new LoginCredentials();
  loginSubscription: Subscription = new Subscription();
  registerSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit() {
  }

  login() {
    const { email, password } = this.model;
    this.loginSubscription = this.authService.login({ email, password }).subscribe((response: any) => {
      if (response.headers.get('Authorization')) {
        localStorage.setItem('token', response.headers.get('Authorization').split(' ')[1])
        localStorage.setItem('mapping', response.userID % 2 === 0 ? '1' : '2');
      }
      this.router.navigate(['/dashboard']);
    }, (error: HttpErrorResponse) => {
      console.error(error);
      this.snackbar.open(error.error.error, '', { duration: 3000 });
    });
  }

  register() {
    const { email, password, setCode } = this.model;
    this.registerSubscription = this.authService.register({ email, password, setCode }).subscribe((response: any) => {
      this.login();
    }, (error: HttpErrorResponse) => {
      console.error(error);
      this.snackbar.open(error.error.message, '', { duration: 3000 });
    });
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
    this.registerSubscription.unsubscribe();
  }

  setMode(mode: string) {
    this.mode = mode;
  }

}
