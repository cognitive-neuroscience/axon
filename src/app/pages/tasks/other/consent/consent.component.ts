import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, of, Subscription } from "rxjs";
import { take } from "rxjs/operators";
import { ConfirmationService } from "src/app/services/confirmation/confirmation.service";
import { EmbeddedPageData, JsonForm } from "../../../../models/InternalDTOs";
import { ConsentService } from "../../../../services/consentService";
import { SessionStorageService } from "../../../../services/sessionStorage.service";
import { SnackbarService } from "../../../../services/snackbar.service";
import { TaskManagerService } from "../../../../services/task-manager.service";

@Component({
    selector: "app-consent",
    templateUrl: "./consent.component.html",
    styleUrls: ["./consent.component.scss"],
})
export class ConsentComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];

    metaData: JsonForm;

    constructor(
        private taskManager: TaskManagerService,
        private _consentService: ConsentService,
        private _sessionStorageService: SessionStorageService,
        private _router: Router,
        private _snackbarService: SnackbarService,
        private confirmationService: ConfirmationService
    ) {
        if (!this.taskManager.hasStudy) {
            this.taskManager.handleErr();
        } else {
            const params = this._router.getCurrentNavigation().extras.state as EmbeddedPageData;

            this.subscriptions.push(
                this.getConsent(params.ID)
                    .pipe(take(1))
                    .subscribe((json) => {
                        this.metaData = json;
                    })
            );
        }
    }

    private getConsent(task: string): Observable<any> {
        return of(null);
        // switch (task) {
        //     case RouteMap.consent.id:
        //         return this._consentService.loadWebPhenoPilotConsentFormJSON();
        //     case RouteMap.stressClinicalDebrief.id:
        //         return this._consentService.loadStressClinicalDebriefFormJSON();
        //     case RouteMap.webPhenoClinical.id:
        //         return this._consentService.loadWebPhenoClinicalConsentFormJSON();
        //     case RouteMap.webPhenoClinicalFR.id:
        //         return this._consentService.loadWebPhenoFRClinicalConsentFormJSON();
        //     case RouteMap.stressClinical.id:
        //         return this._consentService.loadStressClinicalConsentFormJSON();
        //     case RouteMap.stressClinicalFR.id:
        //         return this._consentService.loadStressClinicalFRConsentFormJSON();
        //     case RouteMap.stressPilot.id:
        //         return this._consentService.loadStressPilotConsentFormJSON();
        //     default:
        //         this.taskManager.handleErr();
        //         return;
        // }
    }

    ngOnInit() {}

    consent(answer: boolean) {
        if (answer) {
            this.taskManager.next();
        } else {
            this.subscriptions.push(
                this.confirmationService
                    .openConfirmationDialog("Are you sure you want to cancel?")
                    .pipe(take(1))
                    .subscribe((ok) => {
                        if (ok) {
                            this._sessionStorageService.clearSessionStorage();
                            this._router.navigate(["crowdsource-participant"]);
                            this._snackbarService.openInfoSnackbar("Study was cancelled.");
                        }
                    })
            );
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
