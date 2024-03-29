import { HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpStatus } from 'src/app/models/Auth';
import { RouteNames, SupportedLangs } from 'src/app/models/enums';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserService } from 'src/app/services/user.service';

function passwordMatchingValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !password.value || !confirmPassword || !confirmPassword.value) return null;

    if (password.value !== confirmPassword.value) {
        const err = {
            passwordMatch: 'Passwords do not match!',
        };

        confirmPassword.setErrors(err);
        return err;
    } else {
        return null;
    }
}

@Component({
    selector: 'app-reset-password-login',
    templateUrl: './reset-password-login.component.html',
    styleUrls: ['./reset-password-login.component.scss'],
})
export class ResetPasswordLoginComponent {
    passwordIsVisible = false;
    tempPasswordIsVisible = false;

    resetPasswordForm = this.fb.group(
        {
            email: ['', Validators.compose([Validators.email, Validators.required])],
            temporaryPassword: ['', Validators.compose([Validators.required])],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
        },
        { validators: passwordMatchingValidator }
    );

    constructor(
        private fb: UntypedFormBuilder,
        private router: Router,
        private userService: UserService,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService
    ) {}

    togglePasswordVisibility() {
        this.passwordIsVisible = !this.passwordIsVisible;
    }

    toggleTempPasswordVisibility() {
        this.passwordIsVisible = !this.passwordIsVisible;
    }

    onSubmit() {
        const email = this.resetPasswordForm.controls.email.value;
        const temporaryPassword = this.resetPasswordForm.controls.temporaryPassword.value;
        const password = this.resetPasswordForm.controls.password.value;

        this.loaderService.showLoader();

        this.userService
            .updateUserPassword(email, temporaryPassword, password)
            .subscribe(
                (_res) => {
                    this.snackbarService.openSuccessSnackbar(
                        [
                            'password successfully changed, please log in using your new password',
                            'Le mot de passe a été modifié avec succès, veuillez vous connecter en utilisant votre nouveau mot de passe',
                        ],
                        undefined,
                        20000
                    );
                    this.router.navigate([`login`]);
                },
                (err: HttpStatus) => {
                    switch (err.status) {
                        case HttpStatusCode.Unauthorized:
                            this.snackbarService.openErrorSnackbar('Temporary password is incorrect', undefined, 15000);
                            break;
                        case HttpStatusCode.NotFound:
                            this.snackbarService.openErrorSnackbar(
                                'User with this email does not exist',
                                undefined,
                                15000
                            );
                            break;
                        default:
                            this.snackbarService.openErrorSnackbar(err.message, undefined, 15000);
                            break;
                    }
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
    }
}
