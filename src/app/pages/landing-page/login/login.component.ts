import { Component, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { Subscription } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { SnackbarService } from "src/app/services/snackbar.service";
import { FormBuilder, Validators } from "@angular/forms";
import { LoaderService } from "src/app/services/loader/loader.service";
import { AdminRouteNames, ParticipantRouteNames, Role, RouteNames } from "src/app/models/enums";
import { take } from "rxjs/operators";
import { UserService } from "src/app/services/user.service";
import { ClearanceService } from "src/app/services/clearance.service";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnDestroy {
    private readonly LOGIN_SUCCESS_STR = "Successfully logged in!";

    subscriptions: Subscription[] = [];

    loginForm = this.fb.group({
        email: ["", Validators.compose([Validators.email, Validators.required])],
        password: ["", Validators.required],
        confirmPassword: [""],
    });

    navigateToRegister() {
        this.router.navigate([RouteNames.LANDINGPAGE_REGISTER_SUBROUTE]);
    }

    onSubmit() {
        this.clearanceService.clearServices();

        this.loaderService.showLoader();
        const email = this.loginForm.controls.email.value;
        const password = this.loginForm.controls.password.value;

        this.authService
            .login(email, password)
            .pipe(take(1))
            .subscribe(
                (response) => {
                    this.subscriptions.push(
                        this.userService.userAsync.subscribe(
                            (user) => {
                                if (user !== null) {
                                    this.loaderService.hideLoader();
                                    this.snackbarService.openSuccessSnackbar(this.LOGIN_SUCCESS_STR);
                                    this.handleNavigate(response.role);
                                }
                            },
                            (err) => {
                                this.loaderService.hideLoader();
                                this.snackbarService.openErrorSnackbar(err.message);
                            }
                        )
                    );
                    this.userService.updateUser();
                },
                (error: HttpErrorResponse) => {
                    this.loaderService.hideLoader();
                    this.snackbarService.openErrorSnackbar(error.message);
                }
            );
    }

    constructor(
        private authService: AuthService,
        private router: Router,
        private snackbarService: SnackbarService,
        private fb: FormBuilder,
        private loaderService: LoaderService,
        private userService: UserService,
        private clearanceService: ClearanceService
    ) {}

    private handleNavigate(role: Role) {
        switch (role) {
            case Role.ADMIN:
            case Role.GUEST:
                this.router.navigate([AdminRouteNames.DASHBOARD_BASEROUTE]);
                break;
            case Role.PARTICIPANT:
                this.router.navigate([ParticipantRouteNames.DASHBOARD_BASEROUTE]);
                break;
            default:
                this.snackbarService.openErrorSnackbar("There was an error logging you in");
                break;
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
