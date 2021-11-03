import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/models/enums';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
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
export class ResetPasswordLoginComponent implements OnInit {
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
        private fb: FormBuilder,
        private router: Router,
        private userService: UserService,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService
    ) {}

    ngOnInit(): void {}

    onSubmit() {
        const email = this.resetPasswordForm.controls.email.value;
        const temporaryPassword = this.resetPasswordForm.controls.temporaryPassword.value;
        const password = this.resetPasswordForm.controls.password.value;

        this.loaderService.showLoader();

        this.userService.changePassword(email, temporaryPassword, password).subscribe(
            (res) => {
                this.loaderService.hideLoader();
                this.snackbarService.openSuccessSnackbar('password successfully changed, please log in');
                this.router.navigate([`${RouteNames.LANDINGPAGE_LOGIN_BASEROUTE}`]);
            },
            (err) => {
                this.loaderService.hideLoader();
                this.snackbarService.openErrorSnackbar(err);
            }
        );
    }
}
