import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { take } from "rxjs/operators";
import { ConsentNavigationConfig } from "src/app/pages/shared/consent-component/consent-reader.component";
import { ConfirmationService } from "src/app/services/confirmation/confirmation.service";

@Component({
    selector: "app-consent-dialog",
    templateUrl: "./consent-dialog.component.html",
    styleUrls: ["./consent-dialog.component.scss"],
})
export class ConsentDialogComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ConsentNavigationConfig,
        private confirmationService: ConfirmationService,
        private dialog: MatDialogRef<ConsentDialogComponent>
    ) {}

    ngOnInit(): void {}

    onEmitConsent($event: boolean) {
        if ($event) {
            this.confirmationService
                .openConfirmationDialog("Are you sure you want to accept?")
                .pipe(take(1))
                .subscribe((ok) => {
                    if (ok) this.dialog.close($event);
                });
        } else {
            this.dialog.close();
        }
    }
}
