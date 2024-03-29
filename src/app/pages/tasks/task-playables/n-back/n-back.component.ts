import { Component, HostListener } from '@angular/core';
import { NBackTaskData } from 'src/app/models/ParticipantData';
import { SnackbarService } from '../../../../services/snackbar/snackbar.service';
import { Key, TranslatedFeedback } from 'src/app/models/InternalDTOs';
import { TimerService } from '../../../../services/timer.service';
import { UserResponse } from '../../../../models/InternalDTOs';
import { StimuliProvidedType } from 'src/app/models/enums';
import { AbstractBaseTaskComponent } from '../base-task';
import { TaskPlayerState } from '../task-player/task-player.component';
import { NBackStimulus } from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { ComponentName } from 'src/app/services/component-factory.service';
import { thisOrDefault, throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { TranslateService } from '@ngx-translate/core';

interface NBackMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        skippable: boolean;
        interTrialDelay: number;
        showFeedbackAfterEachTrial: boolean;
        showScoreAfterEachTrial: boolean;
        durationOfFeedback: number;
        durationFixationPresented: number;
        numTrials: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: NBackStimulus[];
        };
    };
}

export enum NBackCache {
    TOTAL_SCORE = 'nback-total-score',
    SHOULD_SKIP = 'nback-should-skip',
}

@Component({
    selector: 'app-n-back',
    templateUrl: './n-back.component.html',
    styleUrls: ['./n-back.component.scss'],
})
export class NBackComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves the participant seeing a stream of letters presented on the screen, one at a time. This is a memory task,
     * so the participant is required to press the left arrow key on the keyboard if the letter they currently see is
     * not the same as the one two letters ago. They are required to press the right arrow key on the keyboard if the
     * letter they currently see is the one presented two letters ago
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number; // In milliseconds
    showFeedbackAfterEachTrial: boolean;
    showScoreAfterEachTrial: boolean;
    private durationOfFeedback: number;
    private durationFixationPresented: number;
    private numTrials: number;
    private skippable: boolean;
    private thresholdForRepeat: number = 0.8;

    // high level variables
    counterbalance: number;
    taskData: NBackTaskData[] = [];
    stimuli: NBackStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    feedback: string;
    showStimulus: boolean = false;
    text: string;
    color: string;
    showFeedback: boolean = false;
    showFixation: boolean = false;
    trialNum: number = 0;
    trialScore: number = 0;
    responseAllowed: boolean = false;
    currentLetter: string;
    nback: string;

    // timers
    maxResponseTimer: any;

    get currentStimulus(): NBackStimulus {
        return this.stimuli[this.currentStimuliIndex];
    }

    get currentTrial(): NBackTaskData {
        // will return null if taskData is not defined or if it has length of 0
        return this.taskData?.length > 0 ? this.taskData[this.taskData.length - 1] : null;
    }

    constructor(
        protected snackbarService: SnackbarService,
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService,
        protected translateService: TranslateService
    ) {
        super(loaderService);
    }

    configure(metadata: NBackMetadata, config: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.numTrials = throwErrIfNotDefined(metadata.componentConfig.numTrials, 'num trials not defined');
            this.maxResponseTime = throwErrIfNotDefined(
                metadata.componentConfig.maxResponseTime,
                'max response time not defined'
            );
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }

        this.config = config;
        this.skippable = thisOrDefault(metadata.componentConfig.skippable, false);
        this.isPractice = thisOrDefault(metadata.componentConfig.isPractice, false);
        this.durationFixationPresented = thisOrDefault(metadata.componentConfig.durationFixationPresented, 0);
        this.interTrialDelay = thisOrDefault(metadata.componentConfig.interTrialDelay, 0);
        this.showFeedbackAfterEachTrial = thisOrDefault(metadata.componentConfig.showFeedbackAfterEachTrial, false);
        this.durationOfFeedback = thisOrDefault(metadata.componentConfig.durationOfFeedback, 0);
        this.showScoreAfterEachTrial = thisOrDefault(metadata.componentConfig.showScoreAfterEachTrial, false);

        this.counterbalance = config.counterBalanceGroups[config.counterbalanceNumber] as number;

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    async start() {
        this.taskData = [];
        this.currentStimuliIndex = 0;

        // either the stimuli has been defined in config or we generate it here from service
        if (!this.stimuli) {
            this.stimuli = this.dataGenService.generateNBackStimuli(this.numTrials, this.counterbalance);
        }
        super.start();
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.showStimulus = false;
        this.showFixation = true;
        await wait(this.durationFixationPresented);
        if (this.isDestroyed) return;
        this.showFixation = false;

        this.setStimuliUI(this.currentStimulus);

        this.taskData.push({
            trial: ++this.trialNum,
            userID: this.userID,
            actualAnswer: this.currentLetter === this.nback ? UserResponse.YES : UserResponse.NO,
            userAnswer: UserResponse.NA,
            responseTime: 0,
            isCorrect: false,
            score: 0,
            set: this.counterbalance,
            submitted: this.timerService.getCurrentTimestamp(),
            isPractice: this.isPractice,
            studyId: this.studyId,
            letterShown: this.currentLetter,
            nback: this.nback,
        });

        this.setTimer(this.maxResponseTime, () => {
            this.showStimulus = false;

            this.handleRoundInteraction(null);
        });

        this.timerService.startTimer();
        this.showStimulus = true;
        this.responseAllowed = true;
    }

    private setStimuliUI(stimulus: NBackStimulus) {
        this.nback = stimulus.nback;
        this.currentLetter = stimulus.currentLetter;
    }

    private setTimer(delay: number, cbFunc?: () => void) {
        this.maxResponseTimer = window.setTimeout(() => {
            if (cbFunc) cbFunc();
        }, delay);
    }

    private isValidKey(key: string): boolean {
        return key === Key.ARROWLEFT || key === Key.ARROWRIGHT;
    }

    private cancelAllTimers() {
        this.snackbarService.clearSnackbar();
        clearTimeout(this.maxResponseTimer);
    }

    @HostListener('window:keydown', ['$event'])
    handleRoundInteraction(event: KeyboardEvent) {
        if (this.currentTrial?.submitted) {
            this.currentTrial.submitted = this.timerService.getCurrentTimestamp();
            if (this.responseAllowed && this.isValidKey(event?.key)) {
                this.currentTrial.responseTime = this.timerService.stopTimerAndGetTime();
                this.cancelAllTimers();
                this.currentTrial.userAnswer = event.key === Key.ARROWLEFT ? UserResponse.NO : UserResponse.YES;
                super.handleRoundInteraction(event.key);
            } else if (event === null) {
                // max time out
                this.cancelAllTimers();
                this.currentTrial.userAnswer = UserResponse.NA;
                this.currentTrial.score = 0;
                this.currentTrial.responseTime = this.maxResponseTime;
                this.currentTrial.isCorrect = false;
                super.handleRoundInteraction(null);
            }
        }
    }

    async completeRound() {
        this.showStimulus = false;
        this.showFixation = false;
        this.responseAllowed = false;

        switch (this.currentTrial.userAnswer) {
            case this.currentTrial.actualAnswer:
                this.feedback = TranslatedFeedback.CORRECT;
                this.currentTrial.isCorrect = true;
                this.currentTrial.score = 10;
                break;
            case UserResponse.NA:
                this.feedback = TranslatedFeedback.TOOSLOW;
                break;
            default:
                this.feedback = TranslatedFeedback.INCORRECT;
                this.currentTrial.isCorrect = false;
                this.currentTrial.score = 0;
                break;
        }

        if (this.showFeedbackAfterEachTrial || this.feedback === TranslatedFeedback.TOOSLOW) {
            this.showFeedback = true;
            await wait(this.durationOfFeedback);
            if (this.isDestroyed) return;
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

            // this will replace the previous block (i.e. the practice block)
            this.config.setCacheValue(NBackCache.TOTAL_SCORE, totalScore);

            const numCorrect = this.taskData.reduce((acc, currVal) => {
                return acc + (currVal.isCorrect ? 1 : 0);
            }, 0);

            const shouldSkip = numCorrect / this.numTrials >= this.thresholdForRepeat;
            this.config.setCacheValue(NBackCache.SHOULD_SKIP, shouldSkip);
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
            const shouldSkip = this.config.getCacheValue(NBackCache.SHOULD_SKIP) as boolean;
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
}
