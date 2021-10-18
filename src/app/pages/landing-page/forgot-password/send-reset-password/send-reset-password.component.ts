import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ParticipantRouteNames, RouteNames } from 'src/app/models/enums';
import { EmailService } from 'src/app/services/email.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
    selector: 'app-send-reset-password',
    templateUrl: './send-reset-password.component.html',
    styleUrls: ['./send-reset-password.scss'],
})
export class SendResetPasswordComponent implements OnInit {
    email: string = '';

    constructor(
        private emailService: EmailService,
        private snackbarService: SnackbarService,
        private router: Router,
        private loaderService: LoaderService
    ) {}

    ngOnInit(): void {}

    handleSubmit() {
        if (this.email.length > 0) {
            this.loaderService.showLoader();
            this.emailService.sendForgotPasswordEmail(this.email).subscribe(
                (ok) => {
                    this.loaderService.hideLoader();
                    if (ok) {
                        this.snackbarService.openSuccessSnackbar('reset email sent to ' + this.email, undefined, 5000);
                        this.router.navigate([`${RouteNames.LANDINGPAGE_RESET_PASSWORD_BASEROUTE}`]);
                    } else {
                        this.snackbarService.openErrorSnackbar(`there was an error sending an email to ${this.email}`);
                    }
                },
                (err) => {
                    this.loaderService.hideLoader();
                    this.snackbarService.openErrorSnackbar(`there was an error sending an email to ${this.email}`);
                }
            );
        }
    }

    navigateToLoginPage() {
        this.router.navigate([RouteNames.LANDINGPAGE_LOGIN_BASEROUTE]);
    }

    navigateToCrowdSourceRegister() {
        this.router.navigate([ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE]);
    }

    navigateToRegister() {
        this.router.navigate([RouteNames.LANDINGPAGE_REGISTER_BASEROUTE]);
    }
}
