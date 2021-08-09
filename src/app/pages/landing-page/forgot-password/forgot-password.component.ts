import { Component, OnInit } from "@angular/core";
import { EmailService } from "src/app/services/email.service";
import { SnackbarService } from "src/app/services/snackbar.service";

@Component({
    selector: "app-forgot-password",
    templateUrl: "./forgot-password.component.html",
    styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnInit {
    email: string = "";

    constructor(private emailService: EmailService, private snackbarService: SnackbarService) {}

    ngOnInit(): void {}

    handleSubmit() {
        if (this.email.length > 0) {
            this.emailService.sendForgotPasswordEmail(this.email).subscribe(
                (ok) => {
                    if (ok) {
                        this.snackbarService.openSuccessSnackbar(`email sent to ${this.email}`);
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
}
