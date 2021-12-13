import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-language-dialog',
    templateUrl: './language-dialog.component.html',
    styleUrls: ['./language-dialog.component.scss'],
})
export class LanguageDialogComponent implements OnInit {
    constructor(private dialogRef: MatDialogRef<LanguageDialogComponent>) {}

    ngOnInit(): void {}

    onEmitLanguage(lang: 'en' | 'fr') {
        this.dialogRef.close(lang);
    }
}
