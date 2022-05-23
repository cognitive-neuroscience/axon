import { Component } from '@angular/core';
import { DigitSpanTaskData } from 'src/app/models/TaskData';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { Feedback, TranslatedFeedback, UserResponse } from 'src/app/models/InternalDTOs';
import { TimerService } from 'src/app/services/timer.service';
import { StimuliProvidedType } from 'src/app/models/enums';
import { AbstractBaseTaskComponent } from '../base-task';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { thisOrDefault, throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { TaskPlayerState } from '../task-player/task-player.component';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DigitSpanStimulus } from 'src/app/services/data-generation/stimuli-models';

interface DigitSpanMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        showFeedbackAfterEachTrial: boolean;
        durationDigitPresented: number;
        durationPauseBetweenDigits: number;
        durationOfFeedback: number;
        delayToShowHelpMessage: number;
        durationHelpMessageShown: number;
        durationFixationPresented: number;
        useForwardSequence: boolean;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: DigitSpanStimulus[];
        };
    };
}

@Component({
    selector: 'app-digit-span',
    templateUrl: './digit-span.component.html',
    styleUrls: ['./digit-span.component.scss'],
})
export class DigitSpanComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves the participant seeing a stream of letters presented on the screen, one at a time. This is a memory task,
     * so the participant is required to read the letters and then use a number pad to enter the letters again.
     * The same is done afterwards but the participant is required to enter the numbers in reverse order.
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number; // In milliseconds
    showFeedbackAfterEachTrial: boolean;
    durationDigitPresented: number;
    private durationOfFeedback: number;
    private durationFixationPresented: number;
    private durationPauseBetweenDigits: number;
    private useForwardSequence: boolean;
    private delayToShowHelpMessage: number;
    private durationHelpMessageShown: number;

    // high level variables
    taskData: DigitSpanTaskData[];
    stimuli: DigitSpanStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    feedback: string;
    showStimulus: boolean = false;
    digitShown: string = '';
    showFeedback: boolean = false;
    showFixation: boolean = false;
    trialNum: number = 0;
    trialScore: number = 0;
    responseAllowed: boolean = false;
    showKeypad: boolean = false;
    currentLevel: 'first' | 'second' = 'first';

    // timers
    maxResponseTimer: any;
    showHelpMessageTimer: any;

    get currentStimulus(): DigitSpanStimulus {
        return this.stimuli[this.currentStimuliIndex];
    }

    get currentTrial(): DigitSpanTaskData {
        return this.taskData[this.taskData.length - 1];
    }

    constructor(
        protected snackbarService: SnackbarService,
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService
    ) {
        super(loaderService);
    }

    configure(metadata: DigitSpanMetadata, config: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.maxResponseTime = throwErrIfNotDefined(
                metadata.componentConfig.maxResponseTime,
                'max response time not defined'
            );

            this.useForwardSequence = throwErrIfNotDefined(
                metadata.componentConfig.useForwardSequence,
                'sequence direction not defined'
            );
        } catch (error) {
            throw new Error('Cannot start study, values not defined:' + error);
        }

        this.config = config;
        this.isPractice = thisOrDefault(metadata.componentConfig.isPractice, false);
        this.durationFixationPresented = thisOrDefault(metadata.componentConfig.durationFixationPresented, 500);
        this.interTrialDelay = thisOrDefault(metadata.componentConfig.interTrialDelay, 0);
        this.durationDigitPresented = thisOrDefault(metadata.componentConfig.durationDigitPresented, 1000);
        this.durationPauseBetweenDigits = thisOrDefault(metadata.componentConfig.durationPauseBetweenDigits, 300);
        this.showFeedbackAfterEachTrial = thisOrDefault(metadata.componentConfig.showFeedbackAfterEachTrial, false);
        this.durationOfFeedback = thisOrDefault(metadata.componentConfig.durationOfFeedback, 0);
        this.delayToShowHelpMessage = thisOrDefault(metadata.componentConfig.delayToShowHelpMessage, 20000);
        this.durationHelpMessageShown = thisOrDefault(metadata.componentConfig.durationHelpMessageShown, 3000);

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    async start() {
        this.taskData = [];
        this.currentStimuliIndex = 0;
        this.currentLevel = 'first';

        // either the stimuli has been defined in config or we generate it here from service
        if (!this.stimuli) {
            this.stimuli = this.dataGenService.generateDigitSpanStimuli(this.isPractice, this.useForwardSequence);
        }
        super.start();
    }

    async beginRound() {
        await this.flashFixation();
        if (this.isDestroyed) return;

        this.showStimulus = true;
        this.showKeypad = false;
        this.showFeedback = false;

        await this.generateStimulus();
        if (this.isDestroyed) return;

        this.taskData.push({
            userID: this.userID,
            trial: ++this.trialNum,
            submitted: this.timerService.getCurrentTimestamp(),
            isPractice: this.isPractice,
            studyId: this.studyId,
            userAnswer: UserResponse.NA,
            actualAnswer: this.getActualAnswer(),
            responseTime: 0,
            numberOfDigits: this.currentStimulus[this.currentLevel].length,
            isCorrect: false,
            score: 0,
            isForwardMemoryMode: this.useForwardSequence,
        });

        this.timerService.startTimer();
        this.showStimulus = false;
        this.showKeypad = true;
        this.responseAllowed = true;

        this.setShowHelpMessageTimer(this.delayToShowHelpMessage, () => {
            if (this.isDestroyed) return;
            this.snackbarService.openInfoSnackbar(
                'Please enter your response',
                undefined,
                this.durationHelpMessageShown
            );
        });

        this.setMaxResponseTimer(this.maxResponseTime, async () => {
            if (this.isDestroyed) return;

            this.responseAllowed = false;
            this.showStimulus = false;
            this.showKeypad = false;
            const message = 'Please do your best to provide your answer in the time allotted for the next trial.';
            this.snackbarService.openInfoSnackbar(message, undefined, this.durationHelpMessageShown, 'center');
            await wait(this.durationHelpMessageShown);
            if (this.isDestroyed) return;

            this.handleRoundInteraction(null);
        });
    }

    private async flashFixation() {
        this.showFixation = true;
        await wait(this.durationFixationPresented);
        this.showFixation = false;
    }

    async generateStimulus() {
        const sequenceToShow = this.currentStimulus[this.currentLevel];
        for (const num of sequenceToShow) {
            this.digitShown = num.toString();
            await wait(this.durationDigitPresented);
            this.digitShown = '';
            await wait(this.durationPauseBetweenDigits);
        }
    }

    private getActualAnswer(): string {
        const thisSequence = this.currentStimulus[this.currentLevel];
        let answer = this.arrayToPaddedString(thisSequence);
        if (!this.useForwardSequence) answer = answer.split('').reverse().join('');
        return answer;
    }

    private arrayToPaddedString(arr: number[]): string {
        let str = '';
        arr.forEach((x) => (str = `${str}${x} `));
        return str.slice(0, str.length - 1);
    }

    private setMaxResponseTimer(delay: number, cbFunc?: () => void) {
        this.maxResponseTimer = window.setTimeout(() => {
            if (cbFunc) cbFunc();
        }, delay);
    }

    private setShowHelpMessageTimer(delay: number, cbFunc?: () => void) {
        this.showHelpMessageTimer = window.setTimeout(() => {
            if (cbFunc) cbFunc();
        }, delay);
    }

    private cancelAllTimers() {
        clearTimeout(this.showHelpMessageTimer);
        clearTimeout(this.maxResponseTimer);
        this.snackbarService.clearSnackbar();
    }

    // adds spaces in between the letters of a string
    private padString(strToPad: string): string {
        let x = '';
        for (const letter of strToPad) {
            x = `${x}${letter} `;
        }
        return x.slice(0, x.length - 1);
    }

    handleRoundInteraction($event: string) {
        this.currentTrial.submitted = this.timerService.getCurrentTimestamp();

        if ($event === null) {
            this.cancelAllTimers();
            this.currentTrial.isCorrect = false;
            this.currentTrial.score = 0;
            this.currentTrial.responseTime = this.maxResponseTime;
            this.currentTrial.userAnswer = UserResponse.NA;
        } else if ($event === UserResponse.NA) {
            this.cancelAllTimers();
            this.responseAllowed = false;
            this.currentTrial.isCorrect = false;
            this.currentTrial.score = 0;
            this.currentTrial.responseTime = this.timerService.stopTimerAndGetTime();
            this.currentTrial.userAnswer = UserResponse.NA;
        } else {
            this.cancelAllTimers();
            this.responseAllowed = false;
            this.currentTrial.responseTime = this.timerService.stopTimerAndGetTime();
            this.currentTrial.userAnswer = this.padString($event);
        }

        super.handleRoundInteraction(null);
    }

    async completeRound() {
        this.showStimulus = false;
        this.showKeypad = false;
        this.responseAllowed = false;

        switch (this.currentTrial.userAnswer) {
            case this.currentTrial.actualAnswer:
                this.feedback = `${this.TRANSLATION_PREFIX}${TranslatedFeedback.CORRECT}`;
                this.currentTrial.isCorrect = true;
                this.currentTrial.score = 10;
                break;
            case UserResponse.NA:
                this.feedback =
                    this.currentTrial.responseTime === this.maxResponseTime
                        ? `${this.TRANSLATION_PREFIX}${TranslatedFeedback.TOOSLOW}`
                        : `${this.TRANSLATION_PREFIX}${TranslatedFeedback.NORESPONSE}`;
                break;
            default:
                this.feedback = `${this.TRANSLATION_PREFIX}${TranslatedFeedback.INCORRECT}`;
                this.currentTrial.isCorrect = false;
                this.currentTrial.score = 0;
                break;
        }

        // show feedback either if they are too slow, or if they don't have any response
        if (
            this.showFeedbackAfterEachTrial ||
            this.feedback === `${this.TRANSLATION_PREFIX}${TranslatedFeedback.TOOSLOW}` ||
            this.feedback === `${this.TRANSLATION_PREFIX}${TranslatedFeedback.NORESPONSE}`
        ) {
            this.showFeedback = true;
            await wait(this.durationOfFeedback);
            this.showFeedback = false;
        }

        super.completeRound();
    }

    async decideToRepeat() {
        // already made second attempt and got it wrong - end the game
        const finishedSecondChance = this.currentLevel === 'second' && !this.currentTrial.isCorrect;
        // we have reached past the final level and the participant was correct
        const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1 && this.currentTrial.isCorrect;

        if (finishedSecondChance || finishedLastStimulus) {
            super.decideToRepeat();
            return;
        } else {
            if (this.currentTrial.isCorrect) {
                this.currentStimuliIndex++;
                this.currentLevel = 'first';
            } else {
                this.currentLevel = 'second';
            }

            await wait(this.interTrialDelay);
            if (this.isDestroyed) return;
            this.beginRound();
            return;
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
