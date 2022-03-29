import { Component, HostListener } from '@angular/core';
import { thisOrDefault, throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { StimuliProvidedType } from 'src/app/models/enums';
import { Feedback, Key } from 'src/app/models/InternalDTOs';
import { SARTTaskData } from 'src/app/models/TaskData';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { SARTStimuliSetType, SARTStimulus, SARTTrialType } from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../base-task';
import { TaskPlayerState } from '../task-player/task-player.component';

export interface SARTMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        durationFeedbackPresented: number;
        durationStimulusPresented: number;
        trialSize: number;
        counterbalanceMode: 'counterbalance' | 'counterbalance-alternative';
        nogoTrialNum: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: SARTStimulus[];
        };
    };
}

enum SARTCache {
    BLOCK_NUM = 'sart-block-num',
}

@Component({
    selector: 'app-sart',
    templateUrl: './sart.component.html',
    styleUrls: ['./sart.component.scss'],
})
export class SartComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves two conditions: ASCENDING and RAND. The participant sees a sequence of digits one after the other. They must left click
     * for all digits they see except for the number 3 - the NOGO stimulus.
     * In the ASCENDING condition, number 1 - 9 are shown to the participant sequentially in order.
     * In the RANDOM condition, numbers 1 - 9 are shown to the participant sequentially in random order.
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number;
    private durationFeedbackPresented: number;
    private durationStimulusPresented: number;
    private nogoTrialNum: number;
    private trialSize: number;

    // high level variables
    counterbalance: SARTStimuliSetType;
    taskData: SARTTaskData[];
    stimuli: SARTStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    blockNum: number = 0;
    feedback: Feedback;
    showStimulus: boolean = false;
    showFeedback: boolean = false;
    showResponseCue: boolean = false;
    trialNum: number = 0;
    responseAllowed: boolean = false;

    // timers
    maxResponseTimer: any;

    get currentStimulus(): SARTStimulus {
        return this.stimuli[this.currentStimuliIndex];
    }

    get currentTrial(): SARTTaskData {
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

    configure(metadata: SARTMetadata, config?: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.trialSize = throwErrIfNotDefined(metadata.componentConfig.trialSize, 'trial size not defined');
            this.maxResponseTime = throwErrIfNotDefined(
                metadata.componentConfig.maxResponseTime,
                'max response time not defined'
            );
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }

        this.config = config;
        this.isPractice = thisOrDefault(metadata.componentConfig.isPractice, false);
        this.maxResponseTime = thisOrDefault(metadata.componentConfig.maxResponseTime, 900);
        this.interTrialDelay = thisOrDefault(metadata.componentConfig.interTrialDelay, 0);
        this.durationFeedbackPresented = thisOrDefault(metadata.componentConfig.durationFeedbackPresented, 1000);
        this.durationStimulusPresented = thisOrDefault(metadata.componentConfig.durationStimulusPresented, 250);
        this.nogoTrialNum = thisOrDefault(metadata.componentConfig.nogoTrialNum, 25);

        this.counterbalance = config.counterBalanceGroups[config.counterbalanceNumber] as SARTStimuliSetType;
        if (this.isPractice) {
            this.counterbalance = SARTStimuliSetType.RANDOM;
        } else if (
            metadata.componentConfig.counterbalanceMode &&
            metadata.componentConfig.counterbalanceMode === 'counterbalance-alternative'
        ) {
            this.counterbalance =
                this.counterbalance === SARTStimuliSetType.ASCENDING
                    ? SARTStimuliSetType.RANDOM
                    : SARTStimuliSetType.ASCENDING;
        }

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    start() {
        this.taskData = [];
        this.currentStimuliIndex = 0;
        this.blockNum = this.config.getCacheValue(SARTCache.BLOCK_NUM) || 1; // set to 1 if not defined

        // either the stimuli has been defined in config or we generate it here from service
        if (!this.stimuli) {
            this.stimuli = this.dataGenService.generateSARTStimuli(
                this.counterbalance,
                this.trialSize,
                this.nogoTrialNum
            );
        }
        super.start();
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.responseAllowed = false;
        this.showFeedback = false;
        this.showResponseCue = false;
        this.showStimulus = true;

        await wait(this.durationStimulusPresented);
        if (this.isDestroyed) return;

        this.showStimulus = false;

        this.taskData.push({
            userID: this.userID,
            isPractice: this.isPractice,
            studyId: this.studyId,
            trial: ++this.trialNum,
            actualAnswer: this.currentStimulus.trialType,
            userAnswer: SARTTrialType.NOGO,
            trialType: this.currentStimulus.trialType,
            fontSize: this.currentStimulus.fontSize,
            digit: this.currentStimulus.digit,
            blockNum: this.blockNum,
            setType: this.counterbalance,
            responseTime: 0,
            isCorrect: false,
            submitted: this.timerService.getCurrentTimestamp(),
        });

        this.setTimer(this.maxResponseTime, () => {
            this.showResponseCue = false;
            this.responseAllowed = false;
            this.handleRoundInteraction(null);
        });

        this.timerService.startTimer();
        this.responseAllowed = true;
        this.showResponseCue = true;
    }

    private setTimer(delay: number, cbFunc?: () => void) {
        this.maxResponseTimer = window.setTimeout(() => {
            if (cbFunc) cbFunc();
        }, delay);
    }

    private cancelAllTimers() {
        this.snackbarService.clearSnackbar();
        clearTimeout(this.maxResponseTimer);
    }

    private isValidKey(key: string): boolean {
        if (!key) return false;
        return key === Key.ARROWLEFT;
    }

    @HostListener('window:keydown', ['$event'])
    handleRoundInteraction(event: KeyboardEvent) {
        if (this.responseAllowed && this.isValidKey(event.key)) {
            const thisTrial = this.taskData[this.taskData.length - 1];
            thisTrial.submitted = this.timerService.getCurrentTimestamp();
            this.cancelAllTimers();
            this.responseAllowed = false;

            thisTrial.responseTime = this.timerService.stopTimerAndGetTime();
            thisTrial.userAnswer = SARTTrialType.GO; // the user made a response and have therefore indicated a GO trial
            super.handleRoundInteraction(null);
        } else if (event === null) {
            const thisTrial = this.taskData[this.taskData.length - 1];
            thisTrial.submitted = this.timerService.getCurrentTimestamp();
            this.cancelAllTimers();
            this.responseAllowed = false;
            thisTrial.userAnswer = SARTTrialType.NOGO; // by not responding, the user has indicated a NOGO trial
            // max time out
            thisTrial.responseTime = this.maxResponseTime;
            super.handleRoundInteraction(null);
        }
    }

    async completeRound() {
        this.showStimulus = false;
        this.showFeedback = false;
        this.showResponseCue = false;
        this.responseAllowed = false;

        const thisTrial = this.taskData[this.taskData.length - 1];

        switch (thisTrial.userAnswer) {
            case thisTrial.actualAnswer:
                this.feedback = Feedback.CORRECT;
                thisTrial.isCorrect = true;
                break;
            default:
                this.feedback = this.currentStimulus.digit === 3 ? Feedback.INCORRECT : Feedback.TOOSLOW;
                thisTrial.isCorrect = false;
                break;
        }

        if (this.isPractice || this.feedback === Feedback.TOOSLOW) {
            this.showFeedback = true;
            await wait(this.durationFeedbackPresented);
            if (this.isDestroyed) return;
            this.showFeedback = false;
        }

        super.completeRound();
    }

    async decideToRepeat() {
        // we have reached past the final activity
        const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1;

        if (finishedLastStimulus) {
            this.config.setCacheValue(SARTCache.BLOCK_NUM, this.isPractice ? this.blockNum : ++this.blockNum);
            super.decideToRepeat();
            return;
        } else {
            this.currentStimuliIndex++;
            await wait(this.interTrialDelay);
            if (this.isDestroyed) return;
            this.beginRound();
            return;
        }
    }
}
