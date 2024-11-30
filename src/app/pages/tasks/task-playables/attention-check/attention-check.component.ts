import { Component, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { ComponentName } from 'src/app/services/component-factory.service';
import { Navigation } from '../../shared/navigation-buttons/navigation-buttons.component';
import { Playable } from '../playable';
import { TaskPlayerState } from '../task-player/task-player.component';
import { TranslateService } from '@ngx-translate/core';

interface AttentionCheckMetadata {
    component: ComponentName;
    componentConfig: {
        numbersDisplayed: number[];
        maxResponseTime: number;
    };
}

export enum AttentionCheckCache {
    USER_ANSWERS = 'attention-check-user-answers',
}

@Component({
    selector: 'app-attention-check',
    templateUrl: './attention-check.component.html',
    styleUrls: ['./attention-check.component.scss'],
})
export class AttentionCheckComponent implements Playable {
    numbersDisplayed: number[] = [];
    userAnswers: string[] = [];
    maxResponseTime: number = 0;
    config: TaskPlayerState;

    // stimulus related variables
    showStimulus: boolean = false;
    numberDisplayed: number;
    promptDisplayed: string = '';
    private responseAllowed: boolean = false;
    private timer: any;

    onComplete = new Subject<{ navigation: Navigation }>();

    private translationMapping = {
        promptBeginningSegment: {
            en: 'Please press',
            fr: '',
        },
        promptEndSegment: {
            en: 'on your keyboard',
            fr: '',
        },
    };

    constructor(private translateService: TranslateService) {}

    configure(metadata: AttentionCheckMetadata, config?: TaskPlayerState): void {
        this.config = config;
        this.numbersDisplayed = metadata.componentConfig.numbersDisplayed;
        this.maxResponseTime = metadata.componentConfig.maxResponseTime;
    }

    private setTimer(delay: number, cbFunc?: () => void) {
        this.timer = window.setTimeout(() => {
            if (cbFunc) cbFunc();
        }, delay);
    }

    afterInit(): void {
        this.begin();
    }

    private setStimulus() {
        this.showStimulus = true;
        this.numberDisplayed = this.numbersDisplayed[this.userAnswers.length];
        const currentLang = this.translateService.currentLang;
        this.promptDisplayed = `${this.translationMapping.promptBeginningSegment[currentLang]} ${this.numberDisplayed} ${this.translationMapping.promptEndSegment[currentLang]}`;
    }

    begin() {
        this.setTimer(this.maxResponseTime, () => {
            this.handleRoundInteraction(null);
        });
        this.responseAllowed = true;
        this.setStimulus();
    }

    @HostListener('window:keydown', ['$event'])
    handleRoundInteraction(event: KeyboardEvent | null) {
        if (!this.responseAllowed) return;
        if (event === null) {
            // we hit our maximum response time
            this.userAnswers.push(null);
        } else {
            this.userAnswers.push(event.key);
        }
        this.completeRound();
    }

    completeRound() {
        this.responseAllowed = false;
        if (this.userAnswers.length >= this.numbersDisplayed.length) {
            this.handleComplete();
        } else {
            this.begin();
        }
    }

    handleComplete(): void {
        this.config.setCacheValue(AttentionCheckCache.USER_ANSWERS, this.userAnswers);
        this.onComplete.next({ navigation: Navigation.NEXT });
    }
}
