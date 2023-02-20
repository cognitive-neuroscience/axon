import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
    constructor(
        private fb: FormBuilder,
        private userStateService: UserStateService,
        private userService: UserService,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService
    ) {}

    profileForm: FormGroup;

    currPassword = '';
    newPassword = '';
    repeatNewPassword = '';

    ngOnInit(): void {
        this.profileForm = this.fb.group({
            name: [this.userStateService.userValue.name, Validators.compose([Validators.required])],
            email: [this.userStateService.userValue.email, Validators.compose([Validators.email, Validators.required])],
        });
    }

    onSubmit() {
        if (!this.profileForm.valid) return;
        this.loaderService.showLoader();
        this.userService
            .updateUser({
                ...this.userStateService.userValue,
                name: this.profileForm.controls['name'].value,
                email: this.profileForm.controls['email'].value,
            })
            .subscribe(
                (res) => {
                    this.snackbarService.openSuccessSnackbar('Updated user details successfully');
                },
                (err) => {
                    this.snackbarService.openErrorSnackbar('There was an error updating the user');
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
    }

    onUpdateUserPassword() {
        if (
            this.currPassword.length === 0 ||
            this.newPassword.length === 0 ||
            this.newPassword !== this.repeatNewPassword
        )
            return;
        this.loaderService.showLoader();
        this.userService
            .updateUserPassword(this.userStateService.userValue.email, this.currPassword, this.newPassword)
            .subscribe(
                () => {
                    this.snackbarService.openSuccessSnackbar('Updated password successfully');
                },
                (err) => {
                    this.snackbarService.openErrorSnackbar('There was an error updating the password');
                }
            )
            .add(() => this.loaderService.hideLoader());
    }
}
