import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ParticipantRouteNames, Role, RouteNames } from 'src/app/models/enums';
import { ClearanceService } from 'src/app/services/clearance.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
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

    private readonly REGISTER_SUCCESS_STR = 'User successfully created! Login using your credentials';

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private userService: UserService,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService,
        private clearanceService: ClearanceService
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
                .registerUser(email, password, Role.PARTICIPANT)
                .subscribe(
                    (_) => {
                        this.snackbarService.openSuccessSnackbar(this.REGISTER_SUCCESS_STR, undefined, 20000);
                        this.router.navigate([RouteNames.LANDINGPAGE_LOGIN_BASEROUTE]);
                    },
                    (error: HttpErrorResponse) => {
                        console.error(error);
                        this.snackbarService.openErrorSnackbar(error.message);
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
