import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { ComponentName } from 'src/app/services/component-factory.service';
import { Playable } from '../playable';
import { TaskPlayerState } from '../task-player/task-player.component';
import { Navigation } from '../../shared/navigation-buttons/navigation-buttons.component';

interface SelectOptionMetadata {
    component: ComponentName;
    componentConfig: {
        question: string;
        cacheKey: string;
        options: {
            label: string;
            value: any;
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

    question: string = '';
    cacheKey: string = '';
    options: {
        label: string;
        value: any;
    }[] = [];

    constructor() {}

    handleSelectOption(selectedOption: string) {
        this.config.setCacheValue(this.cacheKey, selectedOption);
        this.handleComplete(Navigation.NEXT);
    }

    onComplete = new Subject<{ navigation: Navigation }>();

    handleComplete(nav: Navigation) {
        this.onComplete.next({ navigation: nav });
    }

    configure(metadata: SelectOptionMetadata, config: TaskPlayerState): void {
        this.config = config;

        this.question = metadata.componentConfig.question;
        this.cacheKey = metadata.componentConfig.cacheKey;
        this.options = metadata.componentConfig.options;
    }

    afterInit(): void {}
}
