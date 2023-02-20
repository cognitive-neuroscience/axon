import { Component, HostListener } from '@angular/core';
import { Color, Key, UserResponse, TranslatedFeedback } from '../../../../models/InternalDTOs';
import { TaskSwitchingTaskData } from '../../../../models/ParticipantData';
import { TimerService } from '../../../../services/timer.service';
import { StimuliProvidedType, SupportedLangs } from 'src/app/models/enums';
import { AbstractBaseTaskComponent } from '../base-task';
import { thisOrDefault, throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { ComponentName } from 'src/app/services/component-factory.service';
import { TaskSwitchingStimulus } from 'src/app/services/data-generation/stimuli-models';
import { TaskPlayerState } from '../task-player/task-player.component';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { TranslateService } from '@ngx-translate/core';

interface TaskSwitchingMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        showFeedbackAfterEachTrial: boolean;
        skippable: boolean;
        durationOfFeedback: number;
        durationFixationPresented: number;
        showHint: boolean;
        numTrials: number;
        oddEvenColor: Color;
        ltGtColor: Color;
        probOfShift: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: TaskSwitchingStimulus[];
        };
    };
}

export enum TaskSwitchingCache {
    NUM_CORRECT = 'task-switching-num-correct',
    NUM_TRIALS = 'task-switching-num-trials',
    TOTAL_SCORE = 'task-switching-total-score',
    SHOULD_SKIP = 'task-switching-should-skip',
}

@Component({
    selector: 'app-task-switching',
    templateUrl: './task-switching.component.html',
    styleUrls: ['./task-switching.component.scss'],
})
export class TaskSwitchingComponent extends AbstractBaseTaskComponent {
    /**
     * This task is the first part of two. The participant is presented with a number: either
     * orange or blue. If the number is orange, then the participant has to press the left arrow
     * indicating less than 5, or the right arrow indicating greater than 5.
     * If the number is blue, then the participant has to press the left arrow key indicating
     * an odd number, or the right arrow key indicating an even number.
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number;
    showFeedbackAfterEachTrial: boolean;
    private durationOfFeedback: number;
    private numTrials: number;
    private oddEvenColor: Color;
    private ltGtColor: Color;
    private probOfShift: number;
    private durationFixationPresented: number;
    private skippable: boolean;
    showHint: boolean;

    // high level variables
    taskData: TaskSwitchingTaskData[];
    stimuli: TaskSwitchingStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    trialNum: number = 0;
    showStimulus: boolean = false;
    responseAllowed: boolean = false;
    showFixation: boolean = false;
    showFeedback: boolean = false;
    color: string = 'transparent';
    digit: number;
    feedback: string = '';
    thresholdForRepeat: number = 0.8; // currently hardcoded, can change this if required in the future

    // timers
    maxResponseTimer: any;

    get currentStimulus(): TaskSwitchingStimulus {
        return this.stimuli[this.currentStimuliIndex];
    }

    constructor(
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService,
        private translateService: TranslateService
    ) {
        super(loaderService);
    }

    configure(metadata: TaskSwitchingMetadata, config: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.numTrials = throwErrIfNotDefined(metadata.componentConfig.numTrials, 'num trials not defined');
            this.maxResponseTime = throwErrIfNotDefined(
                metadata.componentConfig.maxResponseTime,
                'max response time not defined'
            );
            this.probOfShift = throwErrIfNotDefined(metadata.componentConfig.probOfShift, 'probOfShift not defined');
        } catch (error) {
            throw new Error('values not defined, cannot start study: ' + error);
        }

        this.config = config;
        this.showHint = thisOrDefault(metadata.componentConfig.showHint, false);
        this.isPractice = thisOrDefault(metadata.componentConfig.isPractice, false);
        this.interTrialDelay = thisOrDefault(metadata.componentConfig.interTrialDelay, 0);
        this.skippable = thisOrDefault(metadata.componentConfig.skippable, false);
        this.showFeedbackAfterEachTrial = thisOrDefault(metadata.componentConfig.showFeedbackAfterEachTrial, false);
        this.durationOfFeedback = thisOrDefault(metadata.componentConfig.durationOfFeedback, 0);
        this.oddEvenColor = thisOrDefault(metadata.componentConfig.oddEvenColor, Color.BLUE);
        this.ltGtColor = thisOrDefault(metadata.componentConfig.ltGtColor, Color.ORANGE);
        this.durationFixationPresented = thisOrDefault(metadata.componentConfig.durationFixationPresented, 500);

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    async start() {
        this.taskData = [];
        this.currentStimuliIndex = 0;

        if (!this.stimuli) {
            this.stimuli = this.dataGenService.generateTaskSwitchingStimuli(
                this.numTrials,
                this.probOfShift,
                this.oddEvenColor,
                this.ltGtColor
            );
        }
        super.start();
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.color = Color.TRANSPARENT;
        this.feedback = '';
        this.showFeedback = false;
        this.showFixation = true;
        await wait(this.durationFixationPresented);
        if (this.isDestroyed) return;
        this.showFixation = false;

        this.setStimuliUI(this.currentStimulus);

        let actualAnswer: UserResponse;
        if (this.color === this.oddEvenColor) {
            actualAnswer = this.digit % 2 === 0 ? UserResponse.EVEN : UserResponse.ODD;
        } else {
            actualAnswer = this.digit > 5 ? UserResponse.GREATER : UserResponse.LESSER;
        }

        this.taskData.push({
            trial: ++this.trialNum,
            userID: this.userID,
            color: this.color,
            digit: this.digit,
            actualAnswer: actualAnswer,
            userAnswer: UserResponse.NA,
            responseTime: 0,
            isCorrect: false,
            score: 0,
            isPractice: this.isPractice,
            submitted: this.timerService.getCurrentTimestamp(),
            studyId: this.studyId,
        });

        this.setTimer(this.maxResponseTime, () => {
            this.responseAllowed = false;
            this.handleRoundInteraction(null);
            return;
        });
        this.showStimulus = true;
        this.responseAllowed = true;
        this.timerService.startTimer();
    }

    private isValidKey(key: string): boolean {
        return key === Key.ARROWLEFT || key === Key.ARROWRIGHT;
    }

    private setStimuliUI(stimulus: TaskSwitchingStimulus) {
        this.color = stimulus.color;
        this.digit = stimulus.digit;
    }

    private setTimer(delay: number, cbFunc?: () => void) {
        this.maxResponseTimer = window.setTimeout(() => {
            if (cbFunc) cbFunc();
        }, delay);
    }

    private cancelAllTimers() {
        clearTimeout(this.maxResponseTimer);
    }

    @HostListener('window:keydown', ['$event'])
    handleRoundInteraction(event: KeyboardEvent) {
        const thisTrial = this.taskData[this.taskData.length - 1];
        thisTrial.submitted = this.timerService.getCurrentTimestamp();

        if (event === null) {
            this.cancelAllTimers();
            thisTrial.isCorrect = false;
            thisTrial.responseTime = this.maxResponseTime;
            thisTrial.score = 0;
            super.handleRoundInteraction(null);
            return;
        } else if (this.responseAllowed && this.isValidKey(event.key)) {
            this.cancelAllTimers();
            this.responseAllowed = false;

            let userAnswer: UserResponse;
            thisTrial.responseTime = this.timerService.stopTimerAndGetTime();

            if (thisTrial.color === this.oddEvenColor) {
                userAnswer = event.key === Key.ARROWLEFT ? UserResponse.ODD : UserResponse.EVEN;
            } else {
                userAnswer = event.key === Key.ARROWLEFT ? UserResponse.LESSER : UserResponse.GREATER;
            }
            thisTrial.userAnswer = userAnswer;
            super.handleRoundInteraction(event.key);
            return;
        }
    }

    async completeRound() {
        this.timerService.clearTimer();
        this.showStimulus = false;

        const thisTrial = this.taskData[this.taskData.length - 1];

        switch (thisTrial.userAnswer) {
            case thisTrial.actualAnswer:
                this.feedback = TranslatedFeedback.CORRECT;
                thisTrial.isCorrect = true;
                thisTrial.score = 10;
                break;
            case UserResponse.NA: // too slow
                this.feedback = TranslatedFeedback.TOOSLOW;
                break;
            default:
                // incorrect
                this.feedback = TranslatedFeedback.INCORRECT;
                thisTrial.isCorrect = false;
                thisTrial.score = 0;
                break;
        }

        // we want to show 'Too slow' every time
        if (this.showFeedbackAfterEachTrial || this.feedback === TranslatedFeedback.TOOSLOW) {
            this.showFeedback = true;
            await wait(this.durationOfFeedback);
            this.showFeedback = false;
        }
        super.completeRound();
    }

    async decideToRepeat() {
        // we have reached past the final activity
        const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1;

        if (finishedLastStimulus) {
            const totalScore = this.taskData.reduce((acc, currVal) => {
                return acc + currVal.score;
            }, 0);

            const numCorrect = this.taskData.reduce((acc, currVal) => {
                return acc + (currVal.isCorrect ? 1 : 0);
            }, 0);

            const shouldSkip = numCorrect / this.numTrials >= this.thresholdForRepeat;

            this.config.setCacheValue(TaskSwitchingCache.SHOULD_SKIP, shouldSkip);
            // this will replace the previous block (i.e. the practice blocks)
            this.config.setCacheValue(TaskSwitchingCache.TOTAL_SCORE, totalScore);
            this.config.setCacheValue(TaskSwitchingCache.NUM_CORRECT, numCorrect);
            this.config.setCacheValue(TaskSwitchingCache.NUM_TRIALS, this.numTrials);
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

    afterInit() {
        if (this.skippable) {
            const shouldSkip = this.config.getCacheValue(TaskSwitchingCache.SHOULD_SKIP) as boolean;
            if (shouldSkip === undefined) return;
            // no cached value, do not skip
            else if (shouldSkip) {
                // loader is shown on component init (from the base task constructor)
                // and is supposed to show for 2 seconds. We need to manually cancel that
                // as the component is marked as destroyed (and timeout is cancelled)
                this.loaderService.hideLoader();
                this.handleComplete();
            }
        }
    }

    get reminderImagePath(): string {
        return this.translateService.currentLang === SupportedLangs.EN
            ? '/assets/images/instructions/taskswitching/reminder.png'
            : '/assets/images/instructions/taskswitching/reminder_fr.jpg';
    }
}
