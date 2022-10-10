import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { getTextForLang } from 'src/app/common/commonMethods';
import { SupportedLangs } from 'src/app/models/enums';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { UserService } from 'src/app/services/user.service';
import { AbstractBaseReaderComponent } from '../../tasks/shared/base-reader';

interface ConsentTextContent extends ITranslationText {
    indent?: number;
}

interface ConsentFormInput {
    label: ITranslationText;
    key: string;
    options: {
        textContent: ITranslationText;
        value: string;
    }[];
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
    inputs?: ConsentFormInput[];
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
    @Input()
    readerMetadata: ConsentNavigationConfig;

    inputsFormGroup: UntypedFormGroup;

    ngOnInit() {
        if (this.readerMetadata && this.readerMetadata.metadata.inputs) {
            const formGroup: {
                [key: string]: UntypedFormControl;
            } = {};
            for (let input of this.readerMetadata.metadata.inputs) {
                formGroup[input.key] = new UntypedFormControl('', Validators.required);
            }

            this.inputsFormGroup = new UntypedFormGroup(formGroup);
        }
    }

    get imgPath(): string {
        return this.readerMetadata.metadata?.imgPath || '';
    }

    get title(): string {
        return this.getTranslation(this.readerMetadata.metadata?.title) || '';
    }

    get secondTitle(): string {
        return this.getTranslation(this.readerMetadata.metadata?.secondTitle) || '';
    }

    get endMessage(): string {
        return this.getTranslation(this.readerMetadata.metadata?.endMessage) || '';
    }

    get userIsCrowdsourcedUser(): boolean {
        return this.userService.isCrowdsourcedUser;
    }

    @Output()
    emitConsent: EventEmitter<Record<string, string>> = new EventEmitter();

    constructor(private router: Router, private translateService: TranslateService, private userService: UserService) {
        const state = this.router.getCurrentNavigation()?.extras.state as ConsentNavigationConfig;

        if (state) this.readerMetadata = state;
    }

    onSubmit(response: boolean) {
        if (!response) {
            this.emitConsent.next(null);
        } else {
            const jsonResponse = {};

            Object.keys(this.inputsFormGroup?.controls || {}).forEach((key) => {
                const value = this.inputsFormGroup.controls[key].value;
                jsonResponse[key] = value;
            });

            this.emitConsent.next(jsonResponse);
        }
    }

    getTranslation(textObj: ITranslationText | string): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, textObj);
    }
}
