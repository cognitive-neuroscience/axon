import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { Subscription } from "rxjs";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "src/app/models/Login";
import { SnackbarService } from "src/app/services/snackbar.service";
import { FormBuilder, Validators } from "@angular/forms";
import { LoaderService } from "src/app/services/loader/loader.service";
import { AdminRouteNames, ParticipantRouteNames, Role, RouteNames } from "src/app/models/enums";
import { SessionStorageService } from "src/app/services/sessionStorage.service";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
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

    navigateToCrowdSourceRegister() {
        this.router.navigate([ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE]);
    }

    onSubmit() {
        this.loaderService.showLoader();
        const email = this.loginForm.controls.email.value;
        const password = this.loginForm.controls.password.value;

        this.subscriptions.push(
            this.authService.login(email, password).subscribe(
                (response: HttpResponse<User>) => {
                    this.loaderService.hideLoader();
                    this.snackbarService.openSuccessSnackbar(this.LOGIN_SUCCESS_STR);
                    this.handleNavigate(response.body.role);
                },
                (error: HttpErrorResponse) => {
                    this.loaderService.hideLoader();
                    this.snackbarService.openErrorSnackbar(error.error?.message || error.message);
                }
            )
        );
    }

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private router: Router,
        private snackbarService: SnackbarService,
        private fb: FormBuilder,
        private loaderService: LoaderService,
        private sessionStorageService: SessionStorageService
    ) {}

    ngOnInit() {}

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
