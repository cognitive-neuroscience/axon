import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginCredentials } from 'src/app/models/Login';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginMode } from 'src/app/models/InternalDTOs';
import { throwIfEmpty } from 'rxjs/operators';

function passwordMatchingValidator(fg: FormGroup): {[key: string]: string} | null {
  if(fg.controls.password.value !== fg.controls.confirmPassword.value) {
    const err = {
      "passwordMatch": "Passwords don't match"
    }
    fg.controls.confirmPassword.setErrors(err)
    return err
  } else {
    return null
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  mode: LoginMode = LoginMode.LOGIN;
  model: LoginCredentials = new LoginCredentials();

  loginForm = this.fb.group(
    {
      email: ["", Validators.required],
      password: ["", Validators.required],
      confirmPassword: [""],
    }
  )

  handleClick() {
    if(this.mode === LoginMode.LOGIN) {
      this.login()
    } else {
      this.register()
    }
  }

  loginSubscription: Subscription = new Subscription();
  registerSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
  }

  login() {
    const email = this.loginForm.controls.email.value
    const password = this.loginForm.controls.password.value

    this.loginSubscription = this.authService.login(email, password).subscribe((response: HttpResponse<LoginCredentials>) => {
      if (response.headers.get('Authorization')) {
        const tokenString = response.headers.get("Authorization").split(" ")[1]
        localStorage.setItem('token', tokenString)
      }
      this.router.navigate(['/dashboard']);
    }, (error: HttpErrorResponse) => {
      console.error(error);
      this.snackbarService.openSnackbar(error.error)
    });
  }

  register() {
    const email = this.loginForm.controls.email.value
    const password = this.loginForm.controls.password.value

    this.registerSubscription = this.authService.register(email, password).subscribe((response: HttpResponse<LoginCredentials>) => {
      this.mode = LoginMode.LOGIN
      this.snackbarService.openSnackbar("Successfully created account! Please login with your credentials")
    }, (error: HttpErrorResponse) => {
      console.error(error);
      this.snackbarService.openSnackbar(error.error)
    });
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
    this.registerSubscription.unsubscribe();
  }

  setMode(mode: "LOGIN" | "REGISTER") {
    this.mode = mode === "LOGIN" ? LoginMode.LOGIN : LoginMode.REGISTER

    this.handleConfirmPasswordValidators()
  }

  private handleConfirmPasswordValidators() {
    if(this.mode === LoginMode.REGISTER) {
      this.loginForm.reset()
      this.loginForm.setValidators(passwordMatchingValidator)
    } else {
      this.loginForm.clearValidators()
      this.loginForm.reset()
    }
  }

}
