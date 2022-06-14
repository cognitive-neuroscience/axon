import { Component, HostListener } from '@angular/core';
import { getRandomNumber, thisOrDefault, throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { Feedback, Key, UserResponse } from 'src/app/models/InternalDTOs';
import { StimuliProvidedType, SupportedLangs } from 'src/app/models/enums';
import { SmileyFaceTaskData } from 'src/app/models/TaskData';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../base-task';
import { TaskPlayerState } from '../task-player/task-player.component';
import { SmileyFaceStimulus, SmileyFaceType } from 'src/app/services/data-generation/stimuli-models';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { ImageService } from 'src/app/services/image.service';
import { TranslateService } from '@ngx-translate/core';

interface SmileyFaceMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        durationFeedbackPresented: number;
        durationFixationPresented: number;
        durationStimulusPresented: number;
        durationNoFacePresented: number;
        numShortFaces: number;
        numLongFaces: number;
        facesMoreRewardedPercentage: number;
        facesLessRewardedPercentage: number;
        showHint: boolean;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: SmileyFaceStimulus[];
        };
    };
}

export enum SmileyFaceTaskCounterbalance {
    SHORT_FACE_REWARDED_MORE = 'SHORTFACEREWARDEDMORE',
    LONG_FACE_REWARDED_MORE = 'LONGFACEREWARDEDMORE',
}

enum SmileyFaceCache {
    BLOCK_NUM = 'smiley-face-block-num',
    TOTAL_SCORE = 'smiley-face-total-score',
}

@Component({
    selector: 'app-smiley-face',
    templateUrl: './smiley-face.component.html',
    styleUrls: ['./smiley-face.component.scss'],
})
export class SmileyFaceComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves the participant seeing one of two possible faces: a face with a short mouth, and a face with a
     * longer mouth. The participant presses "Z" if they see a short face, and "M" if they see a long face. If participants
     * get the answer correct for the high reward condition, then there is a X% chance they will be rewarded. For the low
     * reward condition, there is a Y% chance of being rewarded.
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
    private facesMoreRewardedPercentage: number;
    private facesLessRewardedPercentage: number;
    showHint: boolean;

    // high level variables
    counterbalance: SmileyFaceTaskCounterbalance;
    taskData: SmileyFaceTaskData[];
    stimuli: SmileyFaceStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    blockNum: number = 0;
    feedback: Feedback;
    showStimulus: boolean = false;
    showMouth: boolean = false;
    showFeedback: boolean = false;
    showFixation: boolean = false;
    trialNum: number = 0;
    trialScore: number = 0;
    responseAllowed: boolean = false;
    scoreForSpecificTrial: number = 0;

    // mapping
    translationMapping = {
        SHORT: {
            en: 'SHORT',
            fr: 'COURT',
        },
        LONG: {
            en: 'LONG',
            fr: 'LONG',
        },
    };

    // timers
    maxResponseTimer: any;
    showStimulusTimer: any;

    get currentStimulus(): SmileyFaceStimulus {
        return this.stimuli[this.currentStimuliIndex];
    }

    get currentTrial(): SmileyFaceTaskData {
        return this.taskData[this.taskData.length - 1];
    }

    constructor(
        protected snackbarService: SnackbarService,
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService,
        protected imageService: ImageService,
        protected translateService: TranslateService
    ) {
        super(loaderService);
    }

    configure(metadata: SmileyFaceMetadata, config: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.maxResponseTime = throwErrIfNotDefined(
                metadata.componentConfig.maxResponseTime,
                'max response time not defined'
            );
            this.numShortFaces = throwErrIfNotDefined(
                metadata.componentConfig.numShortFaces,
                'num short faces not defined'
            );
            this.numLongFaces = throwErrIfNotDefined(
                metadata.componentConfig.numLongFaces,
                'num long faces not defined'
            );
            this.facesMoreRewardedPercentage = throwErrIfNotDefined(
                metadata.componentConfig.facesMoreRewardedPercentage,
                'num faces less rewarded not defined'
            );
            this.facesLessRewardedPercentage = throwErrIfNotDefined(
                metadata.componentConfig.facesLessRewardedPercentage,
                'num faces more rewarded not defined'
            );
        } catch (error) {
            throw new Error(error);
        }

        this.config = config;

        this.isPractice = thisOrDefault(metadata.componentConfig.isPractice, false);
        this.interTrialDelay = thisOrDefault(metadata.componentConfig.interTrialDelay, 0);
        this.durationFeedbackPresented = thisOrDefault(metadata.componentConfig.durationFeedbackPresented, 1000);
        this.durationFixationPresented = thisOrDefault(metadata.componentConfig.durationFixationPresented, 0);
        this.durationNoFacePresented = thisOrDefault(metadata.componentConfig.durationNoFacePresented, 500);
        this.durationStimulusPresented = thisOrDefault(metadata.componentConfig.durationStimulusPresented, 450);
        this.showHint = thisOrDefault(metadata.componentConfig.showHint, false);

        this.counterbalance = config.counterBalanceGroups[config.counterbalanceNumber] as SmileyFaceTaskCounterbalance;

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    async start() {
        this.taskData = [];
        this.currentStimuliIndex = 0;
        this.blockNum = this.config.getCacheValue(SmileyFaceCache.BLOCK_NUM) || 1; // set to 1 if not defined

        // either the stimuli have been defined in config or we generate it here from service
        if (!this.stimuli) {
            this.stimuli =
                this.counterbalance === SmileyFaceTaskCounterbalance.SHORT_FACE_REWARDED_MORE
                    ? this.dataGenService.generateSmileyFaceStimuli(this.numShortFaces, this.numLongFaces)
                    : this.dataGenService.generateSmileyFaceStimuli(this.numShortFaces, this.numLongFaces);
        }
        super.start();
    }

    async beginRound() {
        this.timerService.clearTimer();
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
            studyId: this.studyId,
            rewardedMore: this.counterbalance,
            isNewVersion: true,
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

        this.showMouth = true;

        // set back to no face after given time
        this.setTimer('showStimulusTimer', this.durationStimulusPresented, () => {
            this.showMouth = false;
        });

        this.setTimer('maxResponseTimer', this.maxResponseTime, () => {
            this.responseAllowed = false;
            this.handleRoundInteraction(null);
        });

        this.timerService.startTimer();
        this.responseAllowed = true;
    }

    private isValidKey(key: string): boolean {
        return key === Key.Z || key === Key.M;
    }

    get hint(): string {
        return this.translationMapping[this.currentStimulus.faceShown][this.translateService.currentLang];
    }

    private setTimer(timerType: 'showStimulusTimer' | 'maxResponseTimer', delay: number, cbFunc?: () => void) {
        if (timerType === 'showStimulusTimer') {
            this.showStimulusTimer = setTimeout(() => {
                if (cbFunc) cbFunc();
            }, delay);
        } else if (timerType === 'maxResponseTimer') {
            this.maxResponseTimer = setTimeout(() => {
                if (cbFunc) cbFunc();
            }, delay);
        } else {
            throw new Error('Invalid Timer type, could not set timer');
        }
    }

    private cancelAllTimers() {
        this.snackbarService.clearSnackbar();
        clearTimeout(this.maxResponseTimer);
    }

    @HostListener('window:keypress', ['$event'])
    handleRoundInteraction(event: KeyboardEvent) {
        this.currentTrial.submitted = this.timerService.getCurrentTimestamp();
        if (this.responseAllowed && this.isValidKey(event.key)) {
            this.cancelAllTimers();
            this.responseAllowed = false;
            this.currentTrial.responseTime = this.timerService.stopTimerAndGetTime();
            this.currentTrial.userAnswer = event.key === Key.Z ? UserResponse.SHORT : UserResponse.LONG;
            this.currentTrial.keyPressed = event.key === Key.Z ? Key.Z : Key.M;

            super.handleRoundInteraction(event.key);
        } else if (event === null) {
            this.cancelAllTimers();
            // max time out
            this.responseAllowed = false;
            this.currentTrial.responseTime = this.maxResponseTime;
            this.currentTrial.userAnswer = UserResponse.NA;
            this.currentTrial.keyPressed = Key.NONE;
            this.currentTrial.score = 0;
            this.currentTrial.isCorrect = false;

            super.handleRoundInteraction(null);
        }
    }

    async completeRound() {
        this.showStimulus = false;
        this.showFixation = false;
        this.responseAllowed = false;
        this.showMouth = false;

        switch (this.currentTrial.userAnswer) {
            case this.currentTrial.actualAnswer:
                this.currentTrial.isCorrect = true;

                const shouldReward = this.shouldReward(this.currentTrial);
                if (shouldReward) {
                    this.currentTrial.rewarded = shouldReward;
                    this.currentTrial.score = 50;
                }
                this.scoreForSpecificTrial = this.currentTrial.score;
                break;
            case UserResponse.NA:
                this.feedback = Feedback.TOOSLOW;
                this.scoreForSpecificTrial = 0;
                break;
            default:
                this.currentTrial.isCorrect = false;
                this.currentTrial.score = 0;
                this.scoreForSpecificTrial = 0;
                break;
        }

        if (this.currentTrial.rewarded || this.feedback === Feedback.TOOSLOW) {
            this.showFeedback = true;
            await wait(this.durationFeedbackPresented);
            if (this.isDestroyed) return;
            this.showFeedback = false;
        }

        this.feedback = null;
        super.completeRound();
    }

    // this function is only called if the user was correct
    private shouldReward(trial: SmileyFaceTaskData): boolean {
        if (this.counterbalance === SmileyFaceTaskCounterbalance.SHORT_FACE_REWARDED_MORE) {
            return trial.stimulus === SmileyFaceType.SHORT
                ? getRandomNumber(0, 100) < this.facesMoreRewardedPercentage
                : getRandomNumber(0, 100) < this.facesLessRewardedPercentage;
        } else {
            return trial.stimulus === SmileyFaceType.SHORT
                ? getRandomNumber(0, 100) < this.facesLessRewardedPercentage
                : getRandomNumber(0, 100) < this.facesMoreRewardedPercentage;
        }
    }

    async decideToRepeat() {
        // we have reached past the final activity
        const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1;

        if (finishedLastStimulus) {
            if (this.isPractice) {
                this.config.setCacheValue(SmileyFaceCache.TOTAL_SCORE, 0);
            } else {
                const previousTotalScore = this.config.getCacheValue(SmileyFaceCache.TOTAL_SCORE) || 0;
                const totalScore = this.taskData.reduce((acc, currVal) => {
                    return acc + currVal.score;
                }, 0);
                this.config.setCacheValue(SmileyFaceCache.TOTAL_SCORE, totalScore + previousTotalScore);
            }

            this.config.setCacheValue(SmileyFaceCache.BLOCK_NUM, this.isPractice ? this.blockNum : ++this.blockNum);

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
