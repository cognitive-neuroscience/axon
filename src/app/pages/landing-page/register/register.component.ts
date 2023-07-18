import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpStatus } from 'src/app/models/Auth';
import { ParticipantRouteNames, Role, RouteNames, SupportedLangs } from 'src/app/models/enums';
import { ClearanceService } from 'src/app/services/clearance.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { TimerService } from 'src/app/services/timer.service';
import { UserService } from 'src/app/services/user.service';

function fieldsMatchingValidator(
    firstFieldName: string,
    secondFieldName: string,
    validationKey: string,
    validationErrMsg: string
) {
    return function (control: AbstractControl): ValidationErrors | null {
        const password = control.get(firstFieldName);
        const confirmPassword = control.get(secondFieldName);

        if (!password || !password.value || !confirmPassword || !confirmPassword.value) return null;

        if (password.value !== confirmPassword.value) {
            const err = {
                [validationKey]: validationErrMsg,
            };

            confirmPassword.setErrors(err);
            return err;
        } else {
            return null;
        }
    };
}

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnDestroy {
    subscriptions: Subscription[] = [];
    passwordIsVisible = false;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private userService: UserService,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService,
        private clearanceService: ClearanceService,
        private timerService: TimerService
    ) {}

    registerForm = this.fb.group(
        {
            email: ['', Validators.compose([Validators.email, Validators.required])],
            confirmEmail: ['', Validators.compose([Validators.email, Validators.required])],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
        },
        {
            validators: [
                fieldsMatchingValidator('password', 'confirmPassword', 'passwordMatchErr', 'Passwords do not match!'),
                fieldsMatchingValidator('email', 'confirmEmail', 'emailMatchErr', 'Emails do not match!'),
            ],
        }
    );

    onSubmit() {
        this.clearanceService.clearServices();

        const email = this.registerForm.controls.email.value;
        const password = this.registerForm.controls.password.value;
        this.loaderService.showLoader();

        this.subscriptions.push(
            this.userService
                .createUser({
                    email,
                    password,
                    name: '',
                    createdAt: this.timerService.getCurrentTimestamp(),
                    id: 0,
                    role: Role.PARTICIPANT,
                    changePasswordRequired: false,
                    lang: SupportedLangs.NONE,
                    organization: null,
                })
                .subscribe(
                    (_) => {
                        this.router.navigate([RouteNames.LANDINGPAGE_LOGIN_BASEROUTE]).then((navigated: boolean) => {
                            if (navigated) {
                                this.snackbarService.openSuccessSnackbar(
                                    [
                                        'Your username was successfully registered! Now, please login using the username and password you just created',
                                        'Votre nom d’utilisateur a été enregistré avec succès! Connectez-vous maintenant en utilisant le nom d’utilisateur et le mot de passe que vous venez de créer',
                                    ],
                                    undefined,
                                    20000
                                );
                            }
                        });
                    },
                    (error: HttpStatus) => {
                        switch (error.status) {
                            case HttpStatusCode.Conflict:
                                this.snackbarService.openErrorSnackbar(
                                    'A user with this email already exists. Please log in or select "Forgot your password?" and follow the steps to reset your password"',
                                    undefined,
                                    20000
                                );
                                break;

                            default:
                                break;
                        }
                        console.error(error);
                    }
                )
                .add(() => {
                    this.loaderService.hideLoader();
                })
        );
    }

    togglePasswordVisibility() {
        this.passwordIsVisible = !this.passwordIsVisible;
    }

    navigateToCrowdSourceRegister() {
        this.router.navigate([ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE]);
    }

    navigateToLoginPage() {
        this.router.navigate([RouteNames.LANDINGPAGE_LOGIN_BASEROUTE]);
    }

    navigateToForgotPassword() {
        this.router.navigate([RouteNames.LANDINGPAGE_FORGOT_PASSWORD_BASEROUTE]);
    }

    ngOnDestroy(): void {
        this.snackbarService.clearSnackbar();
    }
}
