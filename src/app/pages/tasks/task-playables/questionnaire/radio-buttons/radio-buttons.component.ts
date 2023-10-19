import { Component, Input } from '@angular/core';
import { IRadioButtons, TConditional, TOption } from '../models';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { getTextForLang } from 'src/app/common/commonMethods';
import { SupportedLangs } from 'src/app/models/enums';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormGroup, ValidatorFn } from '@angular/forms';

@Component({
    selector: 'app-radio-buttons',
    templateUrl: './radio-buttons.component.html',
    styleUrls: ['./radio-buttons.component.scss'],
})
export class RadioButtonsComponent {
    @Input() question: IRadioButtons;

    @Input() questionnaire: UntypedFormGroup;

    @Input() formControlState: {
        dependentControlsList: (Pick<TConditional, 'doConditional'> & { controlAffectedKey: string })[];
        originalValidators: ValidatorFn[];
        state: { options: TOption[] };
    };

    constructor(private translateService: TranslateService) {}

    handleText(text: string | ITranslationText): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, text);
    }
}
