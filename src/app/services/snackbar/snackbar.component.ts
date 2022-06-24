import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { SupportedLangs } from 'src/app/models/enums';

@Component({
    selector: 'app-snackbar',
    templateUrl: './snackbar.component.html',
    styleUrls: ['./snackbar.component.scss'],
})
export class SnackbarComponent {
    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: string[] | string,
        @Inject(MatSnackBarRef) public snackbar: MatSnackBarRef<any>,
        private translateService: TranslateService
    ) {}

    get textList(): string[] {
        if (!this.data) {
            return [];
        } else if (typeof this.data === 'string') {
            return [this.data];
        } else {
            return this.data;
        }
    }

    get closeAction(): string {
        switch (this.translateService.currentLang) {
            case undefined:
                return 'Close/Fermer';
            case SupportedLangs.EN:
                return 'Close';
            case SupportedLangs.FR:
                return 'Fermer';
            default:
                return 'Close';
        }
    }

    closeSnackbar(): void {
        this.snackbar.dismiss();
    }
}
