import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginCredentials } from 'src/app/models/Login';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginMode, Role } from 'src/app/models/InternalDTOs';
import { SessionStorageService } from '../../services/sessionStorage.service';

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
  private readonly LOGIN_SUCCESS_STR = "Successfully logged in!"

  mode: LoginMode = LoginMode.LOGIN;
  model: LoginCredentials = new LoginCredentials();

  subscriptions: Subscription[] = []

  loginForm = this.fb.group(
    {
      email: ["", Validators.compose([Validators.email, Validators.required])],
      password: ["", Validators.required],
      confirmPassword: [""],
    }
  )

  onSubmit() {
    if(this.mode === LoginMode.LOGIN) {
      this.login()
    } else {
      this.register()
    }
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
    private fb: FormBuilder,
    private sessionStorageService: SessionStorageService,
    private route: Router
  ) { }

  ngOnInit() {
    this.checkIfTokenExistsAndIsValid()
  }

  login() {
    const email = this.loginForm.controls.email.value
    const password = this.loginForm.controls.password.value

    this.subscriptions.push(
      this.authService.login(email, password).subscribe((response: HttpResponse<LoginCredentials>) => {
        if (response.headers.get('Authorization')) {
          const tokenString = response.headers.get("Authorization").split(" ")[1]
          this.sessionStorageService.setTokenInSessionStorage(tokenString)
        }
        this.router.navigate(['/dashboard']);
        this.snackbarService.openSuccessSnackbar(this.LOGIN_SUCCESS_STR)
      }, (error: HttpErrorResponse) => {
        console.error(error);
        this.snackbarService.openErrorSnackbar(error.error.message)
      })
    )
  }

  register() {
    const email = this.loginForm.controls.email.value
    const password = this.loginForm.controls.password.value

    this.subscriptions.push(
      this.authService.register(email, password).subscribe((response: HttpResponse<LoginCredentials>) => {
        this.mode = LoginMode.LOGIN
        this.snackbarService.openSuccessSnackbar(this.REGISTER_SUCCESS_STR)
      }, (error: HttpErrorResponse) => {
        console.error(error);
        this.snackbarService.openErrorSnackbar(error.error.message)
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
        isValid ? this.handleNavigate() : this.sessionStorageService.clearSessionStorage()
      })
    )
  }

  private handleNavigate() {
    const jwt = this.authService.getDecodedToken()
    const role = jwt ? jwt.Role : null
    switch (role) {
      case Role.ADMIN:
        this.route.navigate(['/dashboard/experiments'])
        break;
      case Role.PARTICIPANT:
        // this.snackbarService.openSuccessSnackbar("Route to proper task!")
        console.info("Routing to proper task")
        // this.taskManagerService.startExperiment()
        break;
      default:
        break;
    }
  }
}
