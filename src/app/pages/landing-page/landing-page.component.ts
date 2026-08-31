import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SupportedLangs } from 'src/app/models/enums';
import { LocalStorageService } from 'src/app/services/localStorageService.service';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
    readonly languageOptions: { code: SupportedLangs; label: string }[] = [
        { code: SupportedLangs.EN, label: 'English' },
        { code: SupportedLangs.FR, label: 'Français' },
        { code: SupportedLangs.NL, label: 'Nederlands' },
    ];

    constructor(
        private localStorageService: LocalStorageService,
        private translateService: TranslateService
    ) {}

    ngOnInit(): void {
        const preferredLang = this.localStorageService.getPreferredLangInLocalStorage();
        if (preferredLang) {
            this.translateService.use(preferredLang);
        }
    }

    handleLanguageSelect(newLang: SupportedLangs): void {
        if (newLang === this.currentLang) return;

        this.localStorageService.setPreferredLangInLocalStorage(newLang);
        this.translateService.use(newLang);
    }

    get currentLang(): string {
        return this.translateService.currentLang || SupportedLangs.EN;
    }

    get currentLanguageLabel(): string {
        return this.languageOptions.find((option) => option.code === this.currentLang)?.label ?? 'English';
    }
}
