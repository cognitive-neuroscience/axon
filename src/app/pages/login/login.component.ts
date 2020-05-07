import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginCredentials } from 'src/app/models/LoginCredentials';

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

  login() {
    this.loginSubscription = this.authService.login(this.model).subscribe((response) => {
      if (response.headers.get('Authorization')) {
        localStorage.setItem('token', response.headers.get('Authorization').split(' ')[1])
      }
      this.router.navigate(['/dashboard']);
    }, (error: HttpErrorResponse) => {
      console.error(error);
    });
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }

}
