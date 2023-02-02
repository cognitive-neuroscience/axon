import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ParticipantRouteNames, RouteNames, SupportedLangs } from 'src/app/models/enums';
import { EmailService } from 'src/app/services/email.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-send-reset-password',
    templateUrl: './send-reset-password.component.html',
    styleUrls: ['./send-reset-password.scss'],
})
export class SendResetPasswordComponent implements OnInit {
    email: string = '';

    constructor(
        private userService: UserService,
        private snackbarService: SnackbarService,
        private router: Router,
        private loaderService: LoaderService,
        private translateService: TranslateService
    ) {}

    ngOnInit(): void {}

    handleSubmit() {
        if (this.email.length > 0) {
            this.loaderService.showLoader();
            this.userService
                .sendForgotPasswordEmail(this.email)
                .subscribe(
                    (ok) => {
                        if (ok) {
                            this.snackbarService.openSuccessSnackbar(
                                [
                                    'an email with a temporary password has been sent to ' + this.email,
                                    'un courriel avec un mot de passe temporaire a été envoyé à' + this.email,
                                ],
                                undefined,
                                5000
                            );
                            this.router.navigate([`${RouteNames.LANDINGPAGE_RESET_PASSWORD_BASEROUTE}`]);
                        } else {
                            this.snackbarService.openErrorSnackbar(
                                `there was an error sending an email to ${this.email}`
                            );
                        }
                    },
                    (_err) => {
                        this.snackbarService.openErrorSnackbar(`there was an error sending an email to ${this.email}`);
                    }
                )
                .add(() => {
                    this.loaderService.hideLoader();
                });
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
