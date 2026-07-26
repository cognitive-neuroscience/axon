import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SupportedLangs } from 'src/app/models/enums';

@Component({
    selector: 'app-language-dialog',
    templateUrl: './language-dialog.component.html',
    styleUrls: ['./language-dialog.component.scss'],
})
export class LanguageDialogComponent implements OnInit {
    SupportedLangs = SupportedLangs;

    constructor(private dialogRef: MatDialogRef<LanguageDialogComponent>) {}

    ngOnInit(): void {}

    onEmitLanguage(lang: SupportedLangs.EN | SupportedLangs.FR | SupportedLangs.NL) {
        this.dialogRef.close(lang);
    }
}
