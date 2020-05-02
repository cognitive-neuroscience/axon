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

  model: LoginCredentials = new LoginCredentials();
  loginSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

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
