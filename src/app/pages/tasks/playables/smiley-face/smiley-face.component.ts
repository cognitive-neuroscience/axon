import { Component, HostListener } from "@angular/core";
import { thisOrDefault, throwErrIfNotDefined, wait } from "src/app/common/commonMethods";
import { Feedback, Key, UserResponse } from "src/app/models/InternalDTOs";
import { StimuliProvidedType } from "src/app/models/enums";
import { SmileyFaceTaskData } from "src/app/models/TaskData";
import { SnackbarService } from "src/app/services/snackbar.service";
import { TimerService } from "src/app/services/timer.service";
import { AbstractBaseTaskComponent } from "../base-task";
import { TaskConfig } from "../task-player/task-player.component";
import { SmileyFaceStimulus, SmileyFaceType } from "src/app/services/data-generation/stimuli-models";
import { ComponentName } from "src/app/services/component-factory.service";
import { DataGenerationService } from "src/app/services/data-generation/data-generation.service";
import { LoaderService } from "src/app/services/loader.service";

interface SmileyFaceMetadata {
    component: ComponentName;
    config: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        durationFeedbackPresented: number;
        durationFixationPresented: number;
        durationStimulusPresented: number;
        durationNoFacePresented: number;
        numShortFaces: number;
        numLongFaces: number;
        numFacesMoreRewarded: number;
        numFacesLessRewarded: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: SmileyFaceStimulus[];
        };
    };
}

export enum SmileyFaceTaskCounterbalance {
    SHORT_FACE_REWARDED_MORE = "SHORTFACEREWARDEDMORE",
    LONG_FACE_REWARDED_MORE = "LONGFACEREWARDEDMORE",
}

enum SmileyFaceCache {
    BLOCK_NUM = "smiley-face-block-num",
    TOTAL_SCORE = "smiley-face-total-score",
}

@Component({
    selector: "app-smiley-face",
    templateUrl: "./smiley-face.component.html",
    styleUrls: ["./smiley-face.component.scss"],
})
export class SmileyFaceComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves the participant seeing one of two possible faces: a face with a short mouth, and a face with a
     * longer mouth. The participant presses "Z" if they see a short face, and "M" if they see a long face. Participants always
     * earn points for a correct answer but only sometimes do they see that they have been rewarded.
     * This task is counterbalanced by which face type is rewarded more.
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number; // In milliseconds
    private durationFeedbackPresented: number; // how long the points show for
    private durationFixationPresented: number;
    private durationNoFacePresented: number;
    private durationStimulusPresented: number;
    private numShortFaces: number;
    private numLongFaces: number;
    private numFacesMoreRewarded: number;
    private numFacesLessRewarded: number;

    // shared state variables
    userID: string;
    studyCode: string;
    config: TaskConfig;

    // high level variables
    counterbalance: SmileyFaceTaskCounterbalance;
    taskData: SmileyFaceTaskData[];
    stimuli: SmileyFaceStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    blockNum: number = 0;
    feedback: Feedback;
    showStimulus: boolean = false;
    showFeedback: boolean = false;
    showFixation: boolean = false;
    trialNum: number = 0;
    trialScore: number = 0;
    responseAllowed: boolean = false;
    scoreForSpecificTrial: number = 0;
    smileyFaceType: SmileyFaceType;

    // timers
    maxResponseTimer: any;
    showStimulusTimer: any;

    get currentStimulus(): SmileyFaceStimulus {
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

    configure(metadata: SmileyFaceMetadata, config: TaskConfig) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, "no user ID defined");
            this.studyCode = throwErrIfNotDefined(config.studyCode, "no study code defined");

            this.maxResponseTime = throwErrIfNotDefined(
                metadata.config.maxResponseTime,
                "max response time not defined"
            );
            this.numShortFaces = throwErrIfNotDefined(metadata.config.numShortFaces, "num short faces not defined");
            this.numLongFaces = throwErrIfNotDefined(metadata.config.numLongFaces, "num long faces not defined");
            this.numFacesLessRewarded = throwErrIfNotDefined(
                metadata.config.numFacesLessRewarded,
                "num faces less rewarded not defined"
            );
            this.numFacesMoreRewarded = throwErrIfNotDefined(
                metadata.config.numFacesMoreRewarded,
                "num faces more rewarded not defined"
            );
        } catch (error) {
            throw new error(error);
        }

        this.config = config;

        this.isPractice = thisOrDefault(metadata.config.isPractice, false);
        this.interTrialDelay = thisOrDefault(metadata.config.interTrialDelay, 0);
        this.durationFeedbackPresented = thisOrDefault(metadata.config.durationFeedbackPresented, 1000);
        this.durationFixationPresented = thisOrDefault(metadata.config.durationFixationPresented, 0);
        this.durationNoFacePresented = thisOrDefault(metadata.config.durationNoFacePresented, 500);
        this.durationStimulusPresented = thisOrDefault(metadata.config.durationStimulusPresented, 450);

        this.counterbalance = config.counterBalanceGroups[config.counterbalanceNumber] as SmileyFaceTaskCounterbalance;

        if (metadata.config.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.config.stimuliConfig.stimuli;
    }

    async start() {
        await this.startGameInFullScreen();

        this.taskData = [];
        this.currentStimuliIndex = 0;
        this.blockNum = this.config.getCacheValue(SmileyFaceCache.BLOCK_NUM) || 1; // set to 1 if not defined

        // either the stimuli have been defined in config or we generate it here from service
        if (!this.stimuli) {
            this.stimuli =
                this.counterbalance === SmileyFaceTaskCounterbalance.SHORT_FACE_REWARDED_MORE
                    ? this.dataGenService.generateSmileyFaceStimuli(
                          this.numShortFaces,
                          this.numFacesMoreRewarded,
                          this.numLongFaces,
                          this.numFacesLessRewarded
                      )
                    : this.dataGenService.generateSmileyFaceStimuli(
                          this.numShortFaces,
                          this.numFacesLessRewarded,
                          this.numLongFaces,
                          this.numFacesMoreRewarded
                      );
        }
        super.start();
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.smileyFaceType = SmileyFaceType.NONE;
        this.showStimulus = false;
        this.scoreForSpecificTrial = 0;

        this.taskData.push({
            actualAnswer: this.currentStimulus.faceShown,
            userAnswer: UserResponse.NA,
            responseTime: 0,
            isCorrect: false,
            score: 0,
            block: this.blockNum,
            stimulus: this.currentStimulus.faceShown,
            keyPressed: UserResponse.NA,
            rewarded: false,
            trial: ++this.trialNum,
            userID: this.userID,
            submitted: this.timerService.getCurrentTimestamp(),
            isPractice: this.isPractice,
            studyCode: this.studyCode,
            isRescheduledReward: this.currentStimulus.isRescheduledReward,
            rewardedMore: this.counterbalance,
        });

        // show fixation
        this.showFixation = true;
        await wait(this.durationFixationPresented);
        if (this.isDestroyed) return;
        this.showFixation = false;

        // show no face
        this.showStimulus = true;
        await wait(this.durationNoFacePresented);
        if (this.isDestroyed) return;

        this.setStimuliUI(this.currentStimulus);

        // set back to no face after given time
        this.setTimer("showStimulusTimer", this.durationStimulusPresented, () => {
            this.smileyFaceType = SmileyFaceType.NONE;
        });

        this.setTimer("maxResponseTimer", this.maxResponseTime, () => {
            this.responseAllowed = false;
            this.handleRoundInteraction(null);
        });

        this.timerService.startTimer();
        this.responseAllowed = true;
    }

    private setStimuliUI(stimulus: SmileyFaceStimulus) {
        this.smileyFaceType = stimulus.faceShown;
    }

    private isValidKey(key: string): boolean {
        return key === Key.Z || key === Key.M;
    }

    private setTimer(timerType: "showStimulusTimer" | "maxResponseTimer", delay: number, cbFunc?: () => void) {
        if (timerType === "showStimulusTimer") {
            this.showStimulusTimer = setTimeout(() => {
                if (cbFunc) cbFunc();
            }, delay);
        } else if (timerType === "maxResponseTimer") {
            this.maxResponseTimer = setTimeout(() => {
                if (cbFunc) cbFunc();
            }, delay);
        } else {
            throw new Error("Invalid Timer type, could not set timer");
        }
    }

    private cancelAllTimers() {
        this.snackbarService.clearSnackbar();
        clearTimeout(this.maxResponseTimer);
    }

    @HostListener("window:keypress", ["$event"])
    handleRoundInteraction(event: KeyboardEvent) {
        this.cancelAllTimers();
        const thisTrial = this.taskData[this.taskData.length - 1];
        thisTrial.submitted = this.timerService.getCurrentTimestamp();
        if (this.responseAllowed && this.isValidKey(event.key)) {
            this.responseAllowed = false;
            thisTrial.responseTime = this.timerService.stopTimerAndGetTime();
            thisTrial.userAnswer = event.key === Key.Z ? UserResponse.SHORT : UserResponse.LONG;
            thisTrial.keyPressed = event.key === Key.Z ? Key.Z : Key.M;

            super.handleRoundInteraction(event.key);
        } else if (event === null) {
            // max time out
            this.responseAllowed = false;
            thisTrial.responseTime = this.maxResponseTime;
            thisTrial.userAnswer = UserResponse.NA;
            thisTrial.keyPressed = Key.NONE;
            thisTrial.score = 0;
            thisTrial.isCorrect = false;

            super.handleRoundInteraction(null);
        }
    }

    async completeRound() {
        this.showStimulus = false;
        this.showFixation = false;
        this.responseAllowed = false;
        this.smileyFaceType = SmileyFaceType.NONE;

        const thisTrial = this.taskData[this.taskData.length - 1];

        switch (thisTrial.userAnswer) {
            case thisTrial.actualAnswer:
                thisTrial.isCorrect = true;
                thisTrial.score = 50;
                this.scoreForSpecificTrial = 50;
                break;
            case UserResponse.NA:
                this.feedback = Feedback.TOOSLOW;
                this.postponeReward();
                this.scoreForSpecificTrial = 0;
                break;
            default:
                thisTrial.isCorrect = false;
                this.postponeReward();
                thisTrial.score = 0;
                this.scoreForSpecificTrial = 0;
                break;
        }

        if (this.feedback === Feedback.TOOSLOW) {
        }
        if ((this.currentStimulus.isRewarded && thisTrial.isCorrect) || this.feedback === Feedback.TOOSLOW) {
            this.showFeedback = true;
            await wait(this.durationFeedbackPresented);
            if (this.isDestroyed) return;
            this.showFeedback = false;
        }

        this.feedback = null;
        super.completeRound();
    }

    private postponeReward(): void {
        const trialWhereUserWasIncorrect = this.currentStimulus;

        // iterate through list until you find the next stimulus of the same type that is unrewarded and reward that.
        // if none are found, we complete the iteration without assigning anything as we either have no more trials of that type,
        // or all are rewarded
        for (let i = this.currentStimuliIndex + 1; i < this.stimuli.length; i++) {
            const trial = this.stimuli[i];
            if (trialWhereUserWasIncorrect.faceShown === trial.faceShown && !trial.isRewarded) {
                trial.isRewarded = true;
                trial.isRescheduledReward = true;
                return;
            }
        }
    }

    async decideToRepeat() {
        // we have reached past the final activity
        const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1;

        if (finishedLastStimulus) {
            const totalScore = this.taskData.reduce((acc, currVal) => {
                return acc + currVal.score;
            }, 0);

            this.config.setCacheValue(SmileyFaceCache.TOTAL_SCORE, totalScore);
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
