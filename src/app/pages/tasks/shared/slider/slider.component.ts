import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzMarks } from 'ng-zorro-antd/slider';
import { getTextForLang } from 'src/app/common/commonMethods';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { SupportedLangs } from 'src/app/models/enums';

@Component({
    selector: 'app-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit {
    @Input()
    marks: NzMarks = {};

    @Input()
    shouldReverseLegend: boolean = false;

    @Input()
    startingValue: number = 50;

    @Input()
    helperText: string | ITranslationText = '';

    @Input()
    helperTextFontStyle: string = '';

    @Output()
    sliderValueSelected: EventEmitter<number> = new EventEmitter();

    constructor(private translateService: TranslateService) {}

    ngOnInit(): void {}

    onSelectSlideValue($event: number) {
        this.sliderValueSelected.next($event);
    }

    handleText(text: string | ITranslationText): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, text);
    }
}
