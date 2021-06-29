import { Component, ElementRef, Renderer2 } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { TrailMakingTaskData } from "src/app/models/TaskData";
import { TimerService } from "../../../../services/timer.service";
import { StimuliProvidedType } from "src/app/models/enums";
import { SnackbarService } from "../../../../services/snackbar.service";
import { AbstractBaseTaskComponent } from "../base-task";
import { TaskConfig } from "../task-player/task-player.component";
import { TrailMakingStimulus, TrailMakingTrialType } from "src/app/services/data-generation/stimuli-models";
import { DataGenerationService } from "src/app/services/data-generation/data-generation.service";
import { LoaderService } from "src/app/services/loader/loader.service";
import { ComponentName } from "src/app/services/component-factory.service";
import { thisOrDefault, throwErrIfNotDefined, wait } from "src/app/common/commonMethods";

interface TrailMakingMetadata {
    component: ComponentName;
    config: {
        isPractice: boolean;
        maxResponseTime: number;
        flashIncorrectDuration: number;
        durationOutOfTimeMessageShown: number;
        trialType: TrailMakingTrialType;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: TrailMakingStimulus;
        };
    };
}

@Component({
    selector: "app-trail-making",
    templateUrl: "./trail-making.component.html",
    styleUrls: ["./trail-making.component.scss"],
})
export class TrailMakingComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves the participant being presented with a grid of buttons. There is some
     * order to these buttons (1,2,3,4,5, ..., etc) or (A, 1, B, 2, C, 3, ..., etc). The participant
     * must click through each of these buttons in order to complete the task.
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private flashIncorrectDuration: number;
    private trialType: TrailMakingTrialType;
    private durationOutOfTimeMessageShown: number;

    // shared state variables
    userID: string;
    studyCode: string;
    config: TaskConfig;

    // high level variables
    counterbalance: number;
    taskData: TrailMakingTaskData[];
    stimuli: TrailMakingStimulus;

    // local state variables
    showStimulus: boolean = false;
    text: string;
    color: string;
    showFeedback: boolean = false;
    showFixation: boolean = false;
    trialNum: number = 0;
    responseAllowed: boolean = false;
    correctItems: (string | number)[];

    // timers
    maxResponseTimer: any;

    get currentStimulus(): TrailMakingStimulus {
        return this.stimuli;
    }

    constructor(
        protected snackbarService: SnackbarService,
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService,
        private renderer: Renderer2
    ) {
        super(loaderService);
    }

    configure(metadata: TrailMakingMetadata, config: TaskConfig) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, "no user ID defined");
            this.studyCode = throwErrIfNotDefined(config.studyCode, "no study code defined");

            this.maxResponseTime = throwErrIfNotDefined(
                metadata.config.maxResponseTime,
                "max response time not defined"
            );
            this.trialType = throwErrIfNotDefined(metadata.config.trialType, "no trial type defined");
        } catch (error) {
            throw new error("values not defined, cannot start study");
        }

        this.config = config;
        this.isPractice = thisOrDefault(metadata.config.isPractice, false);
        this.flashIncorrectDuration = thisOrDefault(metadata.config.flashIncorrectDuration, 500);
        this.durationOutOfTimeMessageShown = thisOrDefault(metadata.config.durationOutOfTimeMessageShown, 3000);

        if (metadata.config.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.config.stimuliConfig.stimuli;
    }

    async start() {
        await this.startGameInFullScreen();
        if (this.isDestroyed) return;

        this.taskData = [];
        this.correctItems = [];

        // either the stimuli has been defined in config or we generate it here from service
        if (!this.stimuli) {
            this.stimuli = this.dataGenService.generateTrailMakingStimuli(this.isPractice, this.trialType);
        }
        super.start();
    }

    async beginRound() {
        this.timerService.startTimer();
        this.showStimulus = true;
        this.responseAllowed = true;

        this.maxResponseTimer = this.setMaxResponseTimer(
            this.maxResponseTime,
            this.durationOutOfTimeMessageShown,
            "Out of time!",
            () => {
                this.handleRoundInteraction(null);
            }
        );
    }

    private flashIncorrectColor(elRef: ElementRef, val: number | string) {
        this.changeColor(elRef, "red");
        setTimeout(() => {
            if (!this.correctItems.includes(val)) {
                this.changeColor(elRef, "whitesmoke");
            }
        }, this.flashIncorrectDuration);
    }

    private changeColor(elRef: ElementRef, color: string) {
        this.renderer.setStyle(elRef.nativeElement, "background-color", color);
    }

    private setMaxResponseTimer(delay: number, duration: number, message: string, cbFunc?: () => void) {
        this.maxResponseTimer = setTimeout(async () => {
            this.showStimulus = false;
            this.responseAllowed = false;
            this.snackbarService.openInfoSnackbar(message, "", duration);
            await wait(this.durationOutOfTimeMessageShown);
            if (this.isDestroyed) return;
            if (cbFunc) cbFunc();
        }, delay);
    }

    // sets the button color to green if it is correct and white otherwise
    getColor(val: number | string) {
        return this.correctItems.includes(val) ? "green" : "whitesmoke";
    }

    private cancelAllTimers() {
        clearTimeout(this.maxResponseTimer);
    }

    handleRoundInteraction(event: { button: MatButton; value: number | string }) {
        if (event === null) {
            super.handleRoundInteraction(null);
        } else {
            // if answer has already been recorded as correct, we do nothing
            if (this.correctItems.includes(event.value)) return;

            this.correctItems.push(event.value);
            const currIndex = this.correctItems.length - 1;
            const isCorrect = this.correctItems[currIndex] === this.currentStimulus.correctSequence[currIndex];

            // record the click if actual game
            this.taskData.push({
                userID: this.userID,
                trial: ++this.trialNum,
                timeFromLastClick: this.timerService.stopTimerAndGetTime(),
                trialType: this.trialType,
                userAnswer: event.value.toString(),
                actualAnswer: this.currentStimulus.correctSequence[currIndex].toString(),
                isCorrect: isCorrect,
                submitted: this.timerService.getCurrentTimestamp(),
                isPractice: this.isPractice,
                studyCode: this.studyCode,
            });

            this.timerService.clearTimer();
            this.timerService.startTimer();

            // selected answer is incorrect
            if (!isCorrect) {
                this.correctItems.pop();
                this.flashIncorrectColor(event.button._elementRef, event.value);
            }

            // if we have filled up all the correct Items, complete the round and move on
            if (this.correctItems.length === this.currentStimulus.correctSequence.length)
                super.handleRoundInteraction(event.value);
        }
    }

    async completeRound() {
        this.cancelAllTimers();
        this.showStimulus = false;
        this.responseAllowed = false;

        super.completeRound();
    }

    async decideToRepeat() {
        super.decideToRepeat();
        return;
    }

    // 4 minute timer
    timeToComplete: number = 240000;
    // can be numbers or letters
}
