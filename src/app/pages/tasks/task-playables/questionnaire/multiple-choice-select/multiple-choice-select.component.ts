import { Component, Input } from '@angular/core';
import { IMultipleChoiceSelect, TConditional, TOption } from '../models';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { getTextForLang } from 'src/app/common/commonMethods';
import { SupportedLangs } from 'src/app/models/enums';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormGroup, ValidatorFn } from '@angular/forms';

@Component({
    selector: 'app-multiple-choice-select',
    templateUrl: './multiple-choice-select.component.html',
    styleUrls: ['./multiple-choice-select.component.scss'],
})
export class MultipleChoiceSelectComponent {
    @Input() question: IMultipleChoiceSelect;

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

    get multipleChoiceOptions(): TOption[] {
        if (
            this.question?.condition?.doConditional?.populateResultsBasedOnSelectedValues ||
            (this.question?.actions?.onlyDisableOtherOptionsWhenValueSelected &&
                this.formControlState.state.options.length > 0)
        ) {
            return this.formControlState.state.options;
        } else {
            return this.question.options;
        }
    }
}
