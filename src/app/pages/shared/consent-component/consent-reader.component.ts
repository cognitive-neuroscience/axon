import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { AbstractBaseReaderComponent } from '../../tasks/shared/base-reader';

interface ConsentTextContent extends ITranslationText {
    indent?: number;
}

class ConsentForm {
    imgPath: string;
    title: ITranslationText;
    summary: {
        caption: ITranslationText;
        words: ConsentTextContent[];
    }[];
    secondTitle: ITranslationText;
    body: {
        caption: ITranslationText;
        words: ConsentTextContent[];
    }[];
    inputs: {
        question: ITranslationText;
        key: string;
        options: {
            label: ITranslationText;
            value: string;
        }[];
    }[];
    endMessage: ITranslationText;
    buttons: {
        reject: {
            show: boolean;
            text: ITranslationText;
        };
        accept: {
            show: boolean;
            text: ITranslationText;
        };
    };
}

export class ConsentNavigationConfig {
    metadata: ConsentForm;
    mode: 'test' | 'actual';
}

@Component({
    selector: 'app-consent',
    templateUrl: './consent-reader.component.html',
    styleUrls: ['./consent-reader.component.scss'],
})
export class ConsentReaderComponent implements AbstractBaseReaderComponent, OnInit {
    consentForm: FormGroup;

    @Input()
    readerMetadata: ConsentNavigationConfig;

    get imgPath(): string {
        return this.readerMetadata.metadata?.imgPath || '';
    }

    get title(): string {
        return this.getTextForLang(this.readerMetadata.metadata?.title) || '';
    }

    get secondTitle(): string {
        return this.getTextForLang(this.readerMetadata.metadata?.secondTitle) || '';
    }

    get endMessage(): string {
        return this.getTextForLang(this.readerMetadata.metadata?.endMessage) || '';
    }

    get confirmButtonDisabled(): boolean {
        return this.consentForm.invalid;
    }

    @Output()
    emitConsent: EventEmitter<boolean> = new EventEmitter();

    constructor(private router: Router, private translateService: TranslateService) {
        const state = this.router.getCurrentNavigation()?.extras.state as ConsentNavigationConfig;

        if (state) this.readerMetadata = state;
    }

    ngOnInit(): void {
        this.consentForm = this.getFormGroup();
    }

    private getFormGroup() {
        const formGroup: {
            [key: string]: FormControl;
        } = {};
        (this.readerMetadata?.metadata?.inputs || []).forEach((input) => {
            formGroup[input.key] = new FormControl('', Validators.required);
        });
        return new FormGroup(formGroup);
    }

    onSubmit(response: boolean) {
        this.emitConsent.next(response);
    }

    getTextForLang(textObj: ITranslationText | string): string {
        let lang = this.translateService.currentLang;
        if (!lang) lang = 'en';

        if (!textObj) {
            // textObj is falsy
            return '';
        } else if (typeof textObj === 'string') {
            // for backwards compatibility sake, textObj is just a plain string with no translation
            return textObj;
        } else if (!textObj[lang]) {
            // no translation for the given language
            const hasEnglish = !textObj['en'];
            // also no translation for english
            if (!hasEnglish) return '';
        } else {
            return textObj[lang];
        }
    }
}
