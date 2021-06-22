import { Component, OnDestroy, OnInit } from "@angular/core";
import { NzMarks } from "ng-zorro-antd/slider";
import { wait } from "src/app/common/commonMethods";
import { UserResponse } from "src/app/models/InternalDTOs";
import { ComponentName } from "src/app/services/component-factory.service";
import { DataGenerationService } from "src/app/services/data-generation/data-generation.service";
import { RatingTaskCounterBalance } from "src/app/services/data-generation/raw-data/rating-task-data-list";
import { ChoiceTaskStimuli } from "src/app/services/data-generation/stimuli-models";
import { LoaderService } from "src/app/services/loader.service";
import { SnackbarService } from "src/app/services/snackbar.service";
import { TimerService } from "src/app/services/timer.service";
import { AbstractBaseTaskComponent } from "../../base-task";
import { TaskConfig } from "../../task-player/task-player.component";
import { EverydayChoiceTaskData } from "../rating-new.component";

export interface ChoiceTaskMetadata {
    component: ComponentName;
    config: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        delayToShowHelpMessage: number;
        durationHelpMessageShown: number;
        delayToShowRatingSlider: number;
        durationOutOftimeMessageShown: number;
        stimuliConfig: {
            type: "hardcoded" | "generated";
            stimuli: ChoiceTaskStimuli[];
        };
    };
}

@Component({
    selector: "app-choicer",
    templateUrl: "./choicer.component.html",
    styleUrls: ["./choicer.component.scss", "../rater/rater.component.scss"],
})
export class ChoicerComponent extends AbstractBaseTaskComponent implements OnDestroy {
    /**
     * Task summary:
     * You have the same n activities from the rating task. We create n pairs where each activity appears exactly
     * twice in separate pairs. A slider is shown, and the participant selects a value which indicates whether they
     * prefer the left option or the right option.
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number; // In milliseconds
    private delayToShowHelpMessage: number; //delay to show help message
    private delayToShowRatingSlider: number;
    private durationHelpMessageShown: number;
    private durationOutOftimeMessageShown: number;

    // shared state variables
    userID: string;
    experimentCode: string;
    ratingTaskActivities: string[];

    // high level variables
    taskData: EverydayChoiceTaskData[];
    stimuli: ChoiceTaskStimuli[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    showStimulus: boolean = false;
    showNextButton: boolean = false;
    showSlider: boolean = false;
    trialNum: number = 0;

    currentSliderMarks: NzMarks = {}; // set slider legend

    activityLeft: string = "";
    activityRight: string = "";

    maxResponseTimer: any;
    showHelpMessageTimer: any;

    get currentStimulus(): ChoiceTaskStimuli {
        return this.stimuli[this.currentStimuliIndex];
    }

    constructor(
        protected snackbarService: SnackbarService,
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService
    ) {
        super(loaderService);
    }

    configure(metadata: ChoiceTaskMetadata, config: TaskConfig) {
        this.userID = config.userID;
        this.experimentCode = config.experimentCode;
        this.ratingTaskActivities = config.data;

        this.isPractice = metadata.config.isPractice;
        this.maxResponseTime = metadata.config.maxResponseTime;
        this.interTrialDelay = metadata.config.interTrialDelay;
        this.delayToShowHelpMessage = metadata.config.delayToShowHelpMessage;
        this.durationHelpMessageShown = metadata.config.durationHelpMessageShown;
        this.delayToShowRatingSlider = metadata.config.delayToShowRatingSlider;
        this.durationOutOftimeMessageShown = metadata.config.durationOutOftimeMessageShown;

        if (metadata.config.stimuliConfig.type === "hardcoded") this.stimuli = metadata.config.stimuliConfig.stimuli;
    }

    start() {
        this.taskData = [];
        // either the stimuli has been defined in config or we generate it here
        this.stimuli = !this.stimuli
            ? this.dataGenService.generateChoiceTaskData(this.ratingTaskActivities)
            : this.stimuli;
        this.currentStimuliIndex = 0;
        super.start();
    }

    async beginRound() {
        this.showNextButton = false;
        this.showSlider = false;
        this.timerService.clearTimer();

        this.taskData.push({
            taskName: "Choice Game",
            trial: ++this.trialNum,
            userID: this.userID,
            counterbalance: RatingTaskCounterBalance.NA,
            userAnswer: UserResponse.NA,
            question: "",
            activityLeft: this.currentStimulus.firstActivity,
            activityRight: this.currentStimulus.secondActivity,
            activityType: "",
            responseTime: null,
            score: null,
            submitted: this.timerService.getCurrentTimestamp(),
            isCorrect: null,
            isPractice: this.isPractice,
            experimentCode: this.experimentCode,
        });

        this.setStimuliUI(this.currentStimulus);
        this.showStimulus = true;

        await wait(this.delayToShowRatingSlider);
        if (this.isDestroyed) return;

        this.timerService.startTimer();
        this.showSlider = true;

        this.setTimer(
            "maxResponseTimer",
            "Please do your best to provide your answer in the time allotted for the next trial",
            this.maxResponseTime,
            this.durationOutOftimeMessageShown,
            () => {
                this.showStimulus = false; // callback function called after timeout completes
                this.handleRoundInteraction(null);
            }
        );

        this.setTimer(
            "helpMessageTimer",
            "Please make the rating by adjusting the slider and clicking next",
            this.delayToShowHelpMessage,
            this.durationHelpMessageShown
        );
    }

    private setStimuliUI(stimulus: ChoiceTaskStimuli) {
        this.activityLeft = stimulus.firstActivity;
        this.activityRight = stimulus.secondActivity;

        const tempMarks: NzMarks = {};
        let index = 0;
        const tickIncrement = 100 / (stimulus.legend.length - 1);

        for (let i = 0; i < stimulus.legend.length; i++) {
            tempMarks[index] = stimulus.legend[i];
            index += tickIncrement;
        }

        this.currentSliderMarks = tempMarks;
    }

    /**
     * We want to update the trial with the response time and slider value.
     * Only when we receive null as an arg (meaning that the timeout has completed)
     * that we move on. Otherwise, we just keep replacing the trial with updated data
     */
    async handleRoundInteraction(sliderValue: number) {
        const thisTrial = this.taskData[this.taskData.length - 1];
        if (sliderValue === null) {
            await wait(this.durationOutOftimeMessageShown);
            if (this.isDestroyed) return;
            // no input, ran out of time
            thisTrial.responseTime = this.maxResponseTime;
            thisTrial.userAnswer = UserResponse.NA; // set anchor to default middle
            super.handleRoundInteraction(sliderValue);
            return;
        }

        thisTrial.responseTime = this.timerService.getTime();
        thisTrial.submitted = this.timerService.getCurrentTimestamp();
        thisTrial.userAnswer = sliderValue.toString();
        this.showNextButton = true;
        return;
    }

    completeRound() {
        this.showStimulus = false;
        this.cancelAllTimers();
        super.completeRound();
    }

    async decideToRepeat() {
        // we have reached past the final activity
        const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1;
        if (finishedLastStimulus) {
            // signal to parent component we are done and send over task data
            super.decideToRepeat();
            return;
        }
        this.currentStimuliIndex++;
        await wait(this.interTrialDelay);
        if (this.isDestroyed) return;
        this.beginRound();
        return;
    }

    private setTimer(
        timerType: "helpMessageTimer" | "maxResponseTimer",
        message: string,
        delay: number,
        duration: number,
        cbFunc?: () => void
    ) {
        if (timerType === "helpMessageTimer") {
            this.showHelpMessageTimer = setTimeout(() => {
                this.snackbarService.openErrorSnackbar(message, "", duration);
                if (cbFunc) cbFunc();
            }, delay);
        } else if (timerType === "maxResponseTimer") {
            this.maxResponseTimer = setTimeout(() => {
                this.snackbarService.openErrorSnackbar(message, "", duration);
                if (cbFunc) cbFunc();
            }, delay);
        } else {
            throw new Error("Invalid Timer type, could not set timer");
        }
    }

    private cancelAllTimers() {
        this.snackbarService.clearSnackbar();
        clearTimeout(this.maxResponseTimer);
        clearTimeout(this.showHelpMessageTimer);
    }

    ngOnDestroy() {
        this.isDestroyed = true;
        this.cancelAllTimers();
        this.loaderService.hideLoader();
    }
}
