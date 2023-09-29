import { Component, Input } from '@angular/core';
import { ISlider, TConditional, TOption } from '../models';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { getTextForLang } from 'src/app/common/commonMethods';
import { SupportedLangs } from 'src/app/models/enums';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { NzMarks } from 'ng-zorro-antd/slider';

@Component({
    selector: 'app-slider-control',
    templateUrl: './slider-control.component.html',
    styleUrls: ['./slider-control.component.scss'],
})
export class SliderControlComponent {
    @Input() question: ISlider;

    @Input() questionnaire: UntypedFormGroup;

    @Input() formControlState: {
        dependentControlsList: (Pick<TConditional, 'doAction'> & { controlAffectedKey: string })[];
        originalValidators: ValidatorFn[];
        state: { options: TOption[] };
    };

    constructor(private translateService: TranslateService) {}

    handleText(text: string | ITranslationText): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, text);
    }

    handleSliderValueSelected(key: string, value: number) {
        this.questionnaire.controls[key].setValue(value);
    }

    getSliderMarks(legend: (string | ITranslationText)[]): NzMarks {
        const tempMarks: NzMarks = {};
        if (!legend || legend.length == 0) {
            return {};
        }
        let index = 0;
        const tickIncrement = 100 / (legend.length - 1);

        for (let i = 0; i < legend.length; i++) {
            tempMarks[index] = this.handleText(legend[i]);
            index += tickIncrement;
        }

        return tempMarks;
    }
}
