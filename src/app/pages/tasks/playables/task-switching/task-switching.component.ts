import { Component, HostListener } from "@angular/core";
import { Color, Key, UserResponse, Feedback } from "../../../../models/InternalDTOs";
import { TaskSwitchingTaskData } from "../../../../models/TaskData";
import { TimerService } from "../../../../services/timer.service";
import { StimuliProvidedType } from "src/app/models/enums";
import { AbstractBaseTaskComponent } from "../base-task";
import { thisOrDefault, throwErrIfNotDefined, wait } from "src/app/common/commonMethods";
import { ComponentName } from "src/app/services/component-factory.service";
import { TaskSwitchingStimulus } from "src/app/services/data-generation/stimuli-models";
import { TaskConfig } from "../task-player/task-player.component";
import { DataGenerationService } from "src/app/services/data-generation/data-generation.service";
import { LoaderService } from "src/app/services/loader/loader.service";

interface TaskSwitchingMetadata {
    component: ComponentName;
    config: {
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
    NUM_CORRECT = "task-switching-num-correct",
    NUM_TRIALS = "task-switching-num-trials",
    TOTAL_SCORE = "task-switching-total-score",
    SHOULD_SKIP = "task-switching-should-skip",
}

@Component({
    selector: "app-task-switching",
    templateUrl: "./task-switching.component.html",
    styleUrls: ["./task-switching.component.scss"],
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

    // shared state variables
    userID: string;
    studyCode: string;
    config: TaskConfig;

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
    color: string = "transparent";
    digit: number;
    feedback: string = "";
    thresholdForRepeat: number = 0.8; // currently hardcoded, can change this if required in the future

    // timers
    maxResponseTimer: any;

    get currentStimulus(): TaskSwitchingStimulus {
        return this.stimuli[this.currentStimuliIndex];
    }

    constructor(
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService
    ) {
        super(loaderService);
    }

    configure(metadata: TaskSwitchingMetadata, config: TaskConfig) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, "no user ID defined");
            this.studyCode = throwErrIfNotDefined(config.studyCode, "no study code defined");

            this.numTrials = throwErrIfNotDefined(metadata.config.numTrials, "num trials not defined");
            this.maxResponseTime = throwErrIfNotDefined(
                metadata.config.maxResponseTime,
                "max response time not defined"
            );
            this.probOfShift = throwErrIfNotDefined(metadata.config.probOfShift, "probOfShift not defined");
        } catch (error) {
            throw new error("values not defined, cannot start study: " + error);
        }

        this.config = config;
        this.showHint = thisOrDefault(metadata.config.showHint, false);
        this.isPractice = thisOrDefault(metadata.config.isPractice, false);
        this.interTrialDelay = thisOrDefault(metadata.config.interTrialDelay, 0);
        this.skippable = thisOrDefault(metadata.config.skippable, false);
        this.showFeedbackAfterEachTrial = thisOrDefault(metadata.config.showFeedbackAfterEachTrial, false);
        this.durationOfFeedback = thisOrDefault(metadata.config.durationOfFeedback, 0);
        this.oddEvenColor = thisOrDefault(metadata.config.oddEvenColor, Color.BLUE);
        this.ltGtColor = thisOrDefault(metadata.config.ltGtColor, Color.ORANGE);
        this.durationFixationPresented = thisOrDefault(metadata.config.durationFixationPresented, 500);

        if (metadata.config.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.config.stimuliConfig.stimuli;
    }

    async start() {
        await this.startGameInFullScreen();

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
        this.feedback = "";
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
            studyCode: this.studyCode,
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

    @HostListener("window:keydown", ["$event"])
    handleRoundInteraction(event: KeyboardEvent) {
        this.cancelAllTimers();
        const thisTrial = this.taskData[this.taskData.length - 1];
        thisTrial.submitted = this.timerService.getCurrentTimestamp();

        if (event === null) {
            thisTrial.isCorrect = false;
            thisTrial.responseTime = this.maxResponseTime;
            thisTrial.score = 0;
            super.handleRoundInteraction(null);
            return;
        } else if (this.responseAllowed && this.isValidKey(event.key)) {
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
                this.feedback = Feedback.CORRECT;
                thisTrial.isCorrect = true;
                thisTrial.score = 10;
                break;
            case UserResponse.NA: // too slow
                this.feedback = Feedback.TOOSLOW;
                break;
            default:
                // incorrect
                this.feedback = Feedback.INCORRECT;
                thisTrial.isCorrect = false;
                thisTrial.score = 0;
                break;
        }

        // we want to show 'Too slow' every time
        if (this.showFeedbackAfterEachTrial || this.feedback === Feedback.TOOSLOW) {
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
}
