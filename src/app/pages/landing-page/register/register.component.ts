import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ParticipantRouteNames, Role, RouteNames } from "src/app/models/enums";
import { LoaderService } from "src/app/services/loader/loader.service";
import { SnackbarService } from "src/app/services/snackbar.service";
import { UserService } from "src/app/services/user.service";

function passwordMatchingValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (!password || !password.value || !confirmPassword || !confirmPassword.value) return null;

    if (password.value !== confirmPassword.value) {
        const err = {
            passwordMatch: "Passwords do not match!",
        };

        confirmPassword.setErrors(err);
        return err;
    } else {
        return null;
    }
}

@Component({
    selector: "app-register",
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
    subscriptions: Subscription[] = [];

    private readonly REGISTER_SUCCESS_STR = "User successfully created!";

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private userService: UserService,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService
    ) {}

    registerForm = this.fb.group(
        {
            email: ["", Validators.compose([Validators.email, Validators.required])],
            password: ["", Validators.required],
            confirmPassword: ["", Validators.required],
        },
        { validators: passwordMatchingValidator }
    );

    ngOnInit(): void {}

    onSubmit() {
        const email = this.registerForm.controls.email.value;
        const password = this.registerForm.controls.password.value;
        this.loaderService.showLoader();

        this.subscriptions.push(
            this.userService.registerUser(email, password, Role.PARTICIPANT).subscribe(
                (_) => {
                    this.loaderService.hideLoader();
                    this.snackbarService.openSuccessSnackbar(this.REGISTER_SUCCESS_STR);
                    this.router.navigate([RouteNames.LANDINGPAGE_LOGIN_SUBROUTE]);
                },
                (error: HttpErrorResponse) => {
                    console.error(error);
                    this.snackbarService.openErrorSnackbar(error.error.message);
                }
            )
        );
    }

    navigateToCrowdSourceRegister() {
        this.router.navigate([ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE]);
    }

    navigateToLoginPage() {
        this.router.navigate([RouteNames.LANDINGPAGE_LOGIN_SUBROUTE]);
    }
}
