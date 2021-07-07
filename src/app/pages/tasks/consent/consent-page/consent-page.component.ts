import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { take } from "rxjs/operators";
import { ParticipantRouteNames } from "src/app/models/enums";
import { ConsentNavigationConfig } from "src/app/pages/shared/consent-component/consent-reader.component";
import { ConfirmationService } from "src/app/services/confirmation/confirmation.service";
import { TaskManagerService } from "src/app/services/task-manager.service";

@Component({
    selector: "app-consent-page",
    templateUrl: "./consent-page.component.html",
    styleUrls: ["./consent-page.component.scss"],
})
export class ConsentPageComponent implements OnInit {
    data: ConsentNavigationConfig;
    constructor(
        private confirmationService: ConfirmationService,
        private taskManager: TaskManagerService,
        private router: Router
    ) {
        const params = this.router.getCurrentNavigation().extras.state as ConsentNavigationConfig;
        this.data = params;
    }

    ngOnInit(): void {}

    onEmitConsent(consent: boolean) {
        if (consent) {
            this.confirmationService
                .openConfirmationDialog("Are you sure you want to accept?")
                .pipe(take(1))
                .subscribe((ok) => {
                    if (ok) {
                        this.taskManager.startAfterConsent();
                    }
                });
        } else {
            this.confirmationService
                .openConfirmationDialog(
                    "Are you sure you want to decline?",
                    "You will not be allowed to register again"
                )
                .pipe(take(1))
                .subscribe((ok) => {
                    if (ok) {
                        this.router.navigate([`${ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE}`]);
                    }
                });
        }
    }
}
