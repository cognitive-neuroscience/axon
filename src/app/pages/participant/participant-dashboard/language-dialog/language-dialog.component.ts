import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SupportedLangs } from 'src/app/models/enums';
import { parseSupportedLangs } from 'src/app/models/Organization';

const LANGUAGE_OPTION_LABELS: { code: SupportedLangs; label: string }[] = [
    { code: SupportedLangs.EN, label: 'English' },
    { code: SupportedLangs.FR, label: 'Français' },
    { code: SupportedLangs.NL, label: 'Nederlands' },
];

@Component({
    selector: 'app-language-dialog',
    templateUrl: './language-dialog.component.html',
    styleUrls: ['./language-dialog.component.scss'],
})
export class LanguageDialogComponent {
    languageOptions: { code: SupportedLangs; label: string }[];

    constructor(
        private dialogRef: MatDialogRef<LanguageDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { supportedLangs?: SupportedLangs[] } | null
    ) {
        const supportedLangs = parseSupportedLangs(data?.supportedLangs);
        this.languageOptions = LANGUAGE_OPTION_LABELS.filter((option) => supportedLangs.includes(option.code));
    }

    onEmitLanguage(lang: SupportedLangs) {
        this.dialogRef.close(lang);
    }
}
