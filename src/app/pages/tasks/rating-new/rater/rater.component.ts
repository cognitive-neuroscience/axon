import { Component, OnDestroy } from "@angular/core";
import { SnackbarService } from "src/app/services/snackbar.service";
import { TaskData } from "src/app/models/TaskData";
import { TimerService } from "src/app/services/timer.service";
import { wait } from "src/app/common/commonMethods";
import { DataGenerationService } from "src/app/services/data-generation/data-generation.service";
import { RatingTaskStimuli } from "src/app/services/data-generation/stimuli-models";
import { AbstractBaseTaskComponent } from "../../base-task";
import { TaskConfig } from "../rating-new.component";
import { RatingTaskCounterBalance } from "src/app/services/data-generation/rating-task/rating-task-data-list";
import { LoaderService } from "src/app/services/loader.service";
import { NzMarks } from "ng-zorro-antd/slider";
import { ComponentName } from "src/app/services/component-factory.service";

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
        stimuliConfig: {
            type: "hardcoded" | "generated";
            stimuli: RatingTaskStimuli[];
        };
    };
}

export class RatingTaskData extends TaskData {
    counterbalance: RatingTaskCounterBalance;
    activity: string;
    question: string;
    userAnswer: number;
    activityType: "DoNothing" | "DoSomething";
    responseTime: number;
}

@Component({
    selector: "app-rater",
    templateUrl: "./rater.component.html",
    styleUrls: ["./rater.component.scss"],
})
export class RaterComponent extends AbstractBaseTaskComponent implements OnDestroy {
    private isDestroyed = false;

    // metadata
    protected ratingComponentMetadata: RaterTaskMetadata;

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number; // In milliseconds
    private delayToShowHelpMessage: number; //delay to show help message
    private delayToShowRatingSlider: number;
    private durationHelpMessageShown: number;
    private durationOutOftimeMessageShown: number;
    private counterbalance: RatingTaskCounterBalance;

    // auth variables
    userID: string;
    experimentCode: string;

    // high level variables
    taskData: RatingTaskData[];
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
    helpMessageTimeout: any;

    get currentStimulus(): RatingTaskStimuli {
        return this.stimuli[this.currentStimuliIndex];
    }

    configure(metadata: RaterTaskMetadata, config: TaskConfig) {
        this.userID = config.userID;
        this.experimentCode = config.experimentCode;

        this.ratingComponentMetadata = metadata;
        this.isPractice = metadata.config.isPractice;
        this.maxResponseTime = metadata.config.maxResponseTime;
        this.interTrialDelay = metadata.config.interTrialDelay;
        this.delayToShowHelpMessage = metadata.config.delayToShowHelpMessage;
        this.durationHelpMessageShown = metadata.config.durationHelpMessageShown;
        this.delayToShowRatingSlider = metadata.config.delayToShowRatingSlider;
        this.durationOutOftimeMessageShown = metadata.config.durationOutOftimeMessageShown;

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
        this.stimuli = !this.stimuli ? this.dataGenService.generateRatingTaskData() : this.stimuli;
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
            trial: ++this.trialNum,
            userID: this.userID,
            counterbalance: this.counterbalance,
            userAnswer: null,
            question: this.currentStimulus.questions[this.currentQuestionIndex].question,
            activity: this.currentStimulus.activity,
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
                this.showStimulus = false;
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

    async handleRoundInteraction(event: number) {
        const thisTrial = this.taskData[this.taskData.length - 1];
        if (event === null) {
            await wait(this.durationOutOftimeMessageShown);
            if (this.isDestroyed) return;
            // no input, ran out of time
            thisTrial.responseTime = this.maxResponseTime;
            super.handleRoundInteraction(event);
            return;
        }

        thisTrial.responseTime = this.timerService.getTime();
        thisTrial.submitted = this.timerService.getCurrentTimestamp();
        thisTrial.userAnswer = event;
        this.showNextButton = true;
        return;
    }

    completeRound() {
        this.showStimulus = false;
        this.cancelAllTimers();
        super.completeRound();
    }

    async decideToRepeat() {
        const finishedLastQuestion = this.currentQuestionIndex >= this.currentStimulus.questions.length - 1;
        if (finishedLastQuestion) {
            this.currentQuestionIndex = 0;

            const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1;
            if (finishedLastStimulus) {
                // signal to parent component we are done and send over task data
                super.decideToRepeat();
                return;
            }
            this.currentStimuliIndex++;
        } else {
            this.currentQuestionIndex++;
        }
        this.loaderService.showLoader();
        await wait(this.interTrialDelay);
        if (this.isDestroyed) return;
        this.loaderService.hideLoader();
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
            this.helpMessageTimeout = setTimeout(() => {
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
        clearTimeout(this.helpMessageTimeout);
    }

    ngOnDestroy() {
        this.isDestroyed = true;
        this.cancelAllTimers();
        this.loaderService.hideLoader();
    }
}
