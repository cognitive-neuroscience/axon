import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { ComponentName } from 'src/app/services/component-factory.service';
import { Playable } from '../playable';
import { TaskPlayerState } from '../task-player/task-player.component';
import { Navigation } from '../../shared/navigation-buttons/navigation-buttons.component';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { getTextForLang } from 'src/app/common/commonMethods';
import { TranslateService } from '@ngx-translate/core';
import { SupportedLangs } from 'src/app/models/enums';

interface SelectOptionMetadata {
    component: ComponentName;
    componentConfig: {
        question: string;
        cacheKey: string;
        options: {
            label: ITranslationText;
            value: string | number | boolean | ITranslationText;
        }[];
    };
}

@Component({
    selector: 'app-select-option',
    templateUrl: './select-option.component.html',
    styleUrls: ['./select-option.component.scss'],
})
export class SelectOptionComponent implements Playable {
    config: TaskPlayerState;

    question: ITranslationText | string = '';
    cacheKey: string = '';
    options: {
        label: string;
        value: any;
    }[] = [];

    constructor(private translateService: TranslateService) {}

    handleSelectOption(selectedOption: string) {
        this.config.setCacheValue(this.cacheKey, selectedOption);
        this.handleComplete(Navigation.NEXT);
    }

    handleTranslate(text: ITranslationText | string): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, text);
    }

    onComplete = new Subject<{ navigation: Navigation }>();

    handleComplete(nav: Navigation) {
        this.onComplete.next({ navigation: nav });
    }

    configure(metadata: SelectOptionMetadata, config: TaskPlayerState): void {
        this.config = config;

        this.question = metadata.componentConfig.question;
        this.cacheKey = metadata.componentConfig.cacheKey;
        this.options = metadata.componentConfig.options.map((option) => ({
            label: this.handleTranslate(option.label),
            value: typeof option.value === 'object' ? this.handleTranslate(option.value) : option.value,
        }));
    }

    afterInit(): void {}
}
