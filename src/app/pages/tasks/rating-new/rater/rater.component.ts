import { Component, OnDestroy } from "@angular/core";
import { SnackbarService } from "src/app/services/snackbar.service";
import { TimerService } from "src/app/services/timer.service";
import { wait } from "src/app/common/commonMethods";
import { DataGenerationService } from "src/app/services/data-generation/data-generation.service";
import { RatingTaskStimuli } from "src/app/services/data-generation/stimuli-models";
import { AbstractBaseTaskComponent } from "../../base-task";
import { TaskConfig } from "../../task-player/task-player.component";
import { RatingTaskCounterBalance } from "src/app/services/data-generation/raw-data/rating-task-data-list";
import { LoaderService } from "src/app/services/loader.service";
import { NzMarks } from "ng-zorro-antd/slider";
import { ComponentName } from "src/app/services/component-factory.service";
import { EverydayChoiceTaskData } from "../rating-new.component";
import { UserResponse } from "src/app/models/InternalDTOs";

export interface RaterTaskMetadata {
    component: ComponentName;
    config: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        delayToShowHelpMessage: number;
        durationHelpMessageShown: number;
        delayToShowRatingSlider: number;
        durationOutOftimeMessageShown: number;
        interActivityDelay: number;
        numDoSomethingActivities: number;
        stimuliConfig: {
            type: "hardcoded" | "generated";
            stimuli: RatingTaskStimuli[];
        };
    };
}

@Component({
    selector: "app-rater",
    templateUrl: "./rater.component.html",
    styleUrls: ["./rater.component.scss"],
})
export class RaterComponent extends AbstractBaseTaskComponent implements OnDestroy {
    /**
     * Task summary:
     * You have multiple activities, choosing some from "DoSomething" and some from "DoNothing".
     * For every activity, we ask the same questions in random order. The participant responds to
     * these questions using a slider indicating an extreme based on given labels.
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number; // In milliseconds
    private interActivityDelay: number; // In milliseconds
    private delayToShowHelpMessage: number; //delay to show help message
    private delayToShowRatingSlider: number;
    private durationHelpMessageShown: number;
    private durationOutOftimeMessageShown: number;
    private counterbalance: RatingTaskCounterBalance;
    private numDoSomethingActivities: number;

    // shared state
    userID: string;
    experimentCode: string;
    config: TaskConfig;

    // high level variables
    taskData: EverydayChoiceTaskData[];
    stimuli: RatingTaskStimuli[];
    currentStimuliIndex: number; // index of the stimuli we are on
    currentQuestionIndex: number; // index of the question we are on within the stimulus
    shouldReverse: boolean = false; // based on counterbalance - reverses order of endorsement

    // local state variables
    showStimulus: boolean = false;
    showNextButton: boolean = false;
    showSlider: boolean = false;
    trialNum: number = 0;

    currentSliderMarks: NzMarks = {}; // set slider legend

    activityShown: string = "";
    questionShown: string = "";

    maxResponseTimer: any;
    showHelpMessageTimer: any;

    get currentStimulus(): RatingTaskStimuli {
        return this.stimuli[this.currentStimuliIndex];
    }

    configure(metadata: RaterTaskMetadata, config: TaskConfig) {
        this.userID = config.userID;
        this.experimentCode = config.experimentCode;
        this.config = config;

        this.isPractice = metadata.config.isPractice;
        this.maxResponseTime = metadata.config.maxResponseTime;
        this.interTrialDelay = metadata.config.interTrialDelay;
        this.interActivityDelay = metadata.config.interActivityDelay;
        this.delayToShowHelpMessage = metadata.config.delayToShowHelpMessage;
        this.durationHelpMessageShown = metadata.config.durationHelpMessageShown;
        this.delayToShowRatingSlider = metadata.config.delayToShowRatingSlider;
        this.durationOutOftimeMessageShown = metadata.config.durationOutOftimeMessageShown;
        this.numDoSomethingActivities = metadata.config.numDoSomethingActivities;

        this.counterbalance =
            config.counterbalanceRandomNumber < 50
                ? RatingTaskCounterBalance.LOWTOHIGHENDORSEMENT
                : RatingTaskCounterBalance.HIGHTOLOWENDORSEMENT;

        if (metadata.config.stimuliConfig.type === "hardcoded") this.stimuli = metadata.config.stimuliConfig.stimuli;
    }

    constructor(
        protected snackbarService: SnackbarService,
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService
    ) {
        super(loaderService);
    }

    start() {
        this.taskData = [];
        // either the stimuli has been defined in config or we generate it here
        if (!this.stimuli) {
            this.stimuli = this.dataGenService.generateRatingTaskData(this.numDoSomethingActivities);
            this.config.data = this.stimuli.map((x) => x.activity); // we want to share the activities with the choice task
        }
        this.currentStimuliIndex = 0;
        this.currentQuestionIndex = 0;
        this.shouldReverse = this.counterbalance === RatingTaskCounterBalance.HIGHTOLOWENDORSEMENT;
        super.start();
    }

    async beginRound() {
        this.showNextButton = false;
        this.showSlider = false;
        this.timerService.clearTimer();

        this.taskData.push({
            taskName: "Rating Game",
            trial: ++this.trialNum,
            userID: this.userID,
            counterbalance: this.counterbalance,
            userAnswer: UserResponse.NA,
            question: this.currentStimulus.questions[this.currentQuestionIndex].question,
            activityLeft: this.currentStimulus.activity,
            activityRight: this.currentStimulus.activity,
            activityType: this.currentStimulus.type,
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

    private setStimuliUI(stimulus: RatingTaskStimuli) {
        const stimulusQuestion = stimulus.questions[this.currentQuestionIndex];

        this.activityShown = stimulus.activity;
        this.questionShown = stimulusQuestion.question;

        const tempMarks: NzMarks = {};
        let index = 0;
        const tickIncrement = 100 / (stimulusQuestion.legend.length - 1);

        for (let i = 0; i < stimulusQuestion.legend.length; i++) {
            tempMarks[index] = stimulusQuestion.legend[i];
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
        // we have reached past the final question for the activity
        const finishedLastQuestion = this.currentQuestionIndex >= this.currentStimulus.questions.length - 1;
        if (finishedLastQuestion) {
            this.currentQuestionIndex = 0;

            // we have reached past the final activity
            const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1;
            if (finishedLastStimulus) {
                // signal to parent component we are done and send over task data
                super.decideToRepeat();
                return;
            }
            this.currentStimuliIndex++;
            this.loaderService.showLoader();
            await wait(this.interActivityDelay);
            this.loaderService.hideLoader();
        } else {
            this.currentQuestionIndex++;
            await wait(this.interTrialDelay);
        }
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
