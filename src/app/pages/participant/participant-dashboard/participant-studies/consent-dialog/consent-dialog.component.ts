import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { SupportedLangs } from 'src/app/models/enums';
import { ConsentNavigationConfig } from 'src/app/pages/shared/consent-component/consent-reader.component';
import { ConfirmationService } from 'src/app/services/confirmation/confirmation.service';

@Component({
    selector: 'app-consent-dialog',
    templateUrl: './consent-dialog.component.html',
    styleUrls: ['./consent-dialog.component.scss'],
})
export class ConsentDialogComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ConsentNavigationConfig,
        private confirmationService: ConfirmationService,
        private dialog: MatDialogRef<ConsentDialogComponent>,
        private translateService: TranslateService
    ) {}

    ngOnInit(): void {}

    onEmitConsent($event: boolean) {
        const message =
            this.translateService.currentLang === SupportedLangs.EN
                ? 'Are you sure you want to accept?'
                : 'Êtes-vous certain(e) de vouloir accepter?';

        if ($event) {
            this.confirmationService
                .openConfirmationDialog(message)
                .pipe(take(1))
                .subscribe((ok) => {
                    if (ok) this.dialog.close($event);
                });
        } else {
            this.dialog.close();
        }
    }
}
