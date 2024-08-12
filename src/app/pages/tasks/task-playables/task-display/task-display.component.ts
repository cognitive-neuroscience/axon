import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { getTextForLang, thisOrDefault } from 'src/app/common/commonMethods';
import { ComponentName } from 'src/app/services/component-factory.service';
import { Navigation } from '../../shared/navigation-buttons/navigation-buttons.component';
import { Playable } from '../playable';
import { TaskPlayerState } from '../task-player/task-player.component';
import { TranslateService } from '@ngx-translate/core';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { SupportedLangs } from 'src/app/models/enums';

export interface DisplaySection {
    sectionType: 'text' | 'image-horizontal' | 'image-square' | 'image-small' | 'image-fill';
    imagePath?: string | ITranslationText;
    imageAlignment?: 'left' | 'center' | 'right';
    textContent?: string | ITranslationText;
    injection: 'counterbalance' | 'counterbalance-alternative' | 'cached-string';
    cacheKey: string;
}

export interface ButtonConfig {
    isStart: boolean;
    previousDisabled: boolean;
    nextDisabled: boolean;
}

export interface TaskDisplayComponentMetadata {
    componentName: ComponentName;
    componentConfig: {
        skippable?: boolean;
        skippableCacheKey: string; // name of variable storing the boolean indicating whether to skip
        title?: string | ITranslationText;
        timerConfig?: {
            timer: number;
            showTimer: boolean;
            canSkipTimer: boolean;
            skipAvailableAfterXSeconds: number;
            countDown: boolean;
        };
        subtitle?: string;
        sections?: DisplaySection[];
        buttons?: ButtonConfig;
    };
}

/**
 * This component is for displaying data within a task, i.e. task instructions
 */

@Component({
    selector: 'app-task-display',
    templateUrl: './task-display.component.html',
    styleUrls: ['./task-display.component.scss'],
})
export class TaskDisplayComponent implements OnDestroy, Playable {
    // metadata variables
    title: string = '';
    subtitle: string = '';
    displaySections: DisplaySection[] = [];
    buttonConfig: ButtonConfig = null;
    private canSkipTimer: boolean;
    private skipAvailableAfterXSeconds: number; // option to skip timer available after x seconds. canSkipTimer must be set to true
    skippable: boolean = false; // whether or not we can skip this entire component (not related to timer config)
    cacheKey: string = '';

    // config variables
    config: TaskPlayerState;
    counterbalanceStr: string;
    counterbalanceAltStr: string;

    // local state variables
    showTimer: boolean = false;
    timerMode: boolean = false;
    timerDisplayValue: number;
    timerCountDown: boolean = false;
    showNavigationButtons: boolean = true;

    nextButtonText: string = '';
    previousButtonText: string = '';

    // intervals/timers
    interval: number;

    // implemented
    onComplete = new Subject<{ navigation: Navigation }>();

    constructor(private translateService: TranslateService) {}

    ngOnDestroy() {
        clearInterval(this.interval);
        this.onComplete.complete();
    }

    handleComplete(nav: Navigation) {
        clearInterval(this.interval);
        this.onComplete.next({ navigation: nav });
    }

    onButtonPress(nav: Navigation) {
        this.handleComplete(nav);
    }

    injectString(section: DisplaySection): string {
        const text = getTextForLang(this.translateService.currentLang as SupportedLangs, section.textContent);

        switch (section.injection) {
            case 'cached-string':
                const cachedVar = thisOrDefault(this.config.getCacheValue(section.cacheKey), '');
                return text.replace('???', cachedVar);
            case 'counterbalance':
                return text.replace('???', this.counterbalanceStr);
            case 'counterbalance-alternative':
                return text.replace('???', this.counterbalanceAltStr);
            default:
                return text;
        }
    }

    getTranslation(translationObj: ITranslationText | string): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, translationObj);
    }

    configure(metadata: TaskDisplayComponentMetadata, config: TaskPlayerState): void {
        this.config = config;

        this.skippable = thisOrDefault(metadata.componentConfig.skippable, false);
        this.cacheKey = thisOrDefault(metadata.componentConfig.skippableCacheKey, '');

        this.title = this.getTranslation(metadata.componentConfig.title);
        this.subtitle = thisOrDefault(metadata.componentConfig.subtitle, '');
        this.displaySections = thisOrDefault(metadata.componentConfig.sections, []);
        this.timerMode = thisOrDefault(!!metadata.componentConfig.timerConfig, false);
        this.buttonConfig = thisOrDefault(metadata.componentConfig.buttons, {
            isStart: false,
            previousDisabled: true,
            nextDisabled: false,
        });

        // search the display sections to see if counterbalance needs to be injected
        if (!!metadata.componentConfig.sections.find((section) => section.injection === 'counterbalance')) {
            this.counterbalanceStr = config.counterBalanceGroups[config.counterbalanceNumber];
        }

        // search the display sections to see if counterbalance alt needs to be injected
        if (!!metadata.componentConfig.sections.find((section) => section.injection === 'counterbalance-alternative')) {
            // 3 - 1 == 2, and 3 - 2 == 1. This gives us the value that is not the counterbalance target value
            this.counterbalanceAltStr = config.counterBalanceGroups[3 - config.counterbalanceNumber];
        }

        if (this.timerMode) {
            this.timerCountDown = thisOrDefault(metadata.componentConfig.timerConfig.countDown, false);
            this.showTimer = thisOrDefault(metadata.componentConfig.timerConfig.showTimer, false);
            this.canSkipTimer = thisOrDefault(metadata.componentConfig.timerConfig.canSkipTimer, false);
            this.skipAvailableAfterXSeconds = thisOrDefault(
                metadata.componentConfig.timerConfig.skipAvailableAfterXSeconds,
                0
            );

            if (!this.canSkipTimer || this.skipAvailableAfterXSeconds > 0) {
                this.showNavigationButtons = false;
            }

            this.timerCountDown
                ? this.startTimerReverse(metadata.componentConfig.timerConfig.timer / 1000)
                : this.startTimer(metadata.componentConfig.timerConfig.timer / 1000);
        }

        if (this.buttonConfig.isStart) {
            this.nextButtonText =
                this.translateService.translations[this.translateService.currentLang]?.buttons?.start ?? 'Start';
        } else {
            this.nextButtonText =
                this.translateService.translations[this.translateService.currentLang]?.buttons?.next ?? 'next';
        }
        this.previousButtonText =
            this.translateService.translations[this.translateService.currentLang]?.buttons?.previous ?? 'previous';
    }

    afterInit() {
        if (this.skippable && this.cacheKey) {
            const shouldSkip = this.config.getCacheValue(this.cacheKey);
            if (shouldSkip === undefined) return;
            // no cached value, do not skip
            else if (shouldSkip) this.handleComplete(Navigation.NEXT);
        }
    }

    startTimer(duration: number) {
        this.timerDisplayValue = 1;

        this.interval = window.setInterval(() => {
            this.timerDisplayValue++;

            if (this.canSkipTimer && this.timerDisplayValue >= this.skipAvailableAfterXSeconds) {
                this.showNavigationButtons = true;
            }

            if (this.timerDisplayValue > duration) {
                clearInterval(this.interval);
                this.handleComplete(Navigation.NEXT);
                return;
            }
            return;
        }, 1000);
    }

    startTimerReverse(duration: number) {
        this.timerDisplayValue = duration;
        this.interval = window.setInterval(() => {
            this.timerDisplayValue--;

            if (this.canSkipTimer && this.timerDisplayValue <= duration - this.skipAvailableAfterXSeconds) {
                this.showNavigationButtons = true;
            }

            if (this.timerDisplayValue < 0) {
                clearInterval(this.interval);
                this.handleComplete(Navigation.NEXT);
                return;
            }
            return;
        }, 1000);
    }
}
