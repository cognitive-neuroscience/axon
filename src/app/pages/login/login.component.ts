import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription, Observable } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginCredentials } from 'src/app/models/Login';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginMode, Role } from 'src/app/models/InternalDTOs';
import { LocalStorageService } from '../../services/localStorage.service';

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

  private readonly REGISTER_SUCCESS_STR = "User successfully created! Use your credentials to login."

  mode: LoginMode = LoginMode.LOGIN;
  model: LoginCredentials = new LoginCredentials();

  subscriptions: Subscription[] = []

  loginForm = this.fb.group(
    {
      email: ["", Validators.required],
      password: ["", Validators.required],
      confirmPassword: [""],
    }
  )

  onSubmit() {
    console.log("handling");
    
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
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private route: Router
  ) { }

  ngOnInit() {
    this.checkIfTokenExistsAndIsValid()
  }

  login() {
    const email = this.loginForm.controls.email.value
    const password = this.loginForm.controls.password.value

    this.subscriptions.push(
      this.loginSubscription = this.authService.login(email, password).subscribe((response: HttpResponse<LoginCredentials>) => {
        if (response.headers.get('Authorization')) {
          const tokenString = response.headers.get("Authorization").split(" ")[1]
          this.localStorageService.setTokenInLocalStorage(tokenString)
        }
        this.router.navigate(['/dashboard']);
      }, (error: HttpErrorResponse) => {
        console.error(error);
        this.snackbarService.openErrorSnackbar(error.error)
      })
    )
  }

  register() {
    const email = this.loginForm.controls.email.value
    const password = this.loginForm.controls.password.value

    this.subscriptions.push(
      this.registerSubscription = this.authService.register(email, password).subscribe((response: HttpResponse<LoginCredentials>) => {
        this.mode = LoginMode.LOGIN
        this.snackbarService.openSuccessSnackbar(this.REGISTER_SUCCESS_STR)
      }, (error: HttpErrorResponse) => {
        console.error(error);
        this.snackbarService.openErrorSnackbar(error.error)
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
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

  private checkIfTokenExistsAndIsValid(): void {
    this.subscriptions.push(
      this.authService.isAuthenticated().subscribe(isValid => {
        // if isValid, token exists in localStorage
        // if not valid, clear local storage
        isValid ? this.handleNavigate() : this.localStorageService.clearLocalStorage()
      })
    )
  }

  private handleNavigate() {
    const token = this.localStorageService.getTokenFromLocalStorage()
    const jwt = this.authService.decodeToken(token)
    switch (jwt.Role) {
      case Role.ADMIN:
        this.route.navigate(['/dashboard/experiments'])
        break;
      case Role.PARTICIPANT:
        console.log("NEED TO NAVIGATE TO PARTICIPANT HOME PAGE");
        // this.route.navigate(['/'])
        break;
      default:
        break;
    }
  }
}
