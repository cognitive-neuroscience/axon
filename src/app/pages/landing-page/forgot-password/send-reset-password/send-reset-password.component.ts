import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ParticipantRouteNames, RouteNames } from "src/app/models/enums";
import { EmailService } from "src/app/services/email.service";
import { SnackbarService } from "src/app/services/snackbar.service";

@Component({
    selector: "app-send-reset-password",
    templateUrl: "./send-reset-password.component.html",
    styleUrls: ["./send-reset-password.scss"],
})
export class SendResetPasswordComponent implements OnInit {
    email: string = "";

    constructor(private emailService: EmailService, private snackbarService: SnackbarService, private router: Router) {}

    ngOnInit(): void {}

    handleSubmit() {
        if (this.email.length > 0) {
            this.emailService.sendForgotPasswordEmail(this.email).subscribe(
                (ok) => {
                    if (ok) {
                        this.snackbarService.openSuccessSnackbar("reset email sent to " + this.email, undefined, 5000);
                    } else {
                        this.snackbarService.openErrorSnackbar(`there was an error sending an email to ${this.email}`);
                    }
                },
                (err) => {
                    this.snackbarService.openErrorSnackbar(`there was an error sending an email to ${this.email}`);
                }
            );
        }
    }

    navigateToLoginPage() {
        this.router.navigate([RouteNames.LANDINGPAGE_LOGIN_SUBROUTE]);
    }

    navigateToCrowdSourceRegister() {
        this.router.navigate([ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE]);
    }

    navigateToForgotPassword() {
        this.router.navigate([RouteNames.LANDINGPAGE_FORGOT_PASSWORD]);
    }
}
