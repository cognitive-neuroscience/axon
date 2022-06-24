import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getTextForLang } from 'src/app/common/commonMethods';
import { SupportedLangs } from 'src/app/models/enums';
import { ITranslationText } from 'src/app/models/InternalDTOs';

@Component({
    selector: 'app-option-display',
    templateUrl: './option-display.component.html',
    styleUrls: ['./option-display.component.scss'],
})
export class OptionDisplayComponent implements OnInit {
    @Input()
    question: string | ITranslationText;

    @Input()
    options: {
        label: string;
        value: number | boolean | string;
    }[] = [];

    constructor(private translateService: TranslateService) {}

    getTranslatedText(text: string | ITranslationText): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, text);
    }

    @Output()
    onSelectValue: EventEmitter<string> = new EventEmitter();

    handleSelectOption(value: string) {
        this.onSelectValue.emit(value);
    }

    ngOnInit(): void {}
}
