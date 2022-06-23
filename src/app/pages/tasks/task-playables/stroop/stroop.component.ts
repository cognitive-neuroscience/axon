import { Component, HostListener } from '@angular/core';
import { StroopTaskData } from '../../../../models/TaskData';
import { SnackbarService } from '../../../../services/snackbar/snackbar.service';
import { Key, TranslatedFeedback } from 'src/app/models/InternalDTOs';
import { StimuliProvidedType, SupportedLangs } from 'src/app/models/enums';
import { TimerService } from '../../../../services/timer.service';
import { UserResponse } from '../../../../models/InternalDTOs';
import { AbstractBaseTaskComponent } from '../base-task';
import { ComponentName } from 'src/app/services/component-factory.service';
import { StroopStimulus } from 'src/app/services/data-generation/stimuli-models';
import { TaskPlayerState } from '../task-player/task-player.component';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { thisOrDefault, throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { TranslateService } from '@ngx-translate/core';

interface StroopTaskMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        showFeedbackAfterEachTrial: boolean;
        showScoreAfterEachTrial: boolean;
        durationOfFeedback: number;
        durationFixationPresented: number;
        numTrials: number;
        numCongruent: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: StroopStimulus[];
        };
    };
}

export enum StroopCache {
    TOTAL_SCORE = 'stroop-total-score',
}

@Component({
    selector: 'app-stroop-task',
    templateUrl: './stroop.component.html',
    styleUrls: ['./stroop.component.scss'],
})
export class StroopComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves the participant seeing one of three different words: "RED", "GREEN", "BLUE".
     * These words will either be colored in red, green, or blue. The participant must press "1" if the word is colored
     * red, "2" if the word is colored blue, and "3" if the word is colored green. The actual semantics or content of the
     * word do not matter
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
    private numCongruent: number;

    // high level variables
    counterbalance: number;
    taskData: StroopTaskData[];
    stimuli: StroopStimulus[];
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
    scoreForSpecificTrial: number = 0;

    // translation mapping
    translationMap = {
        red: 'rouge',
        blue: 'bleu',
        green: 'vert',
    };

    // timers
    maxResponseTimer: any;

    get currentStimulus(): StroopStimulus {
        return this.stimuli[this.currentStimuliIndex];
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

    configure(metadata: StroopTaskMetadata, config: TaskPlayerState) {
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
        this.isPractice = thisOrDefault(metadata.componentConfig.isPractice, false);
        this.durationFixationPresented = thisOrDefault(metadata.componentConfig.durationFixationPresented, 0);
        this.interTrialDelay = thisOrDefault(metadata.componentConfig.interTrialDelay, 0);
        this.showFeedbackAfterEachTrial = thisOrDefault(metadata.componentConfig.showFeedbackAfterEachTrial, false);
        this.durationOfFeedback = thisOrDefault(metadata.componentConfig.durationOfFeedback, 0);
        this.showScoreAfterEachTrial = thisOrDefault(metadata.componentConfig.showScoreAfterEachTrial, false);
        this.numCongruent = thisOrDefault(metadata.componentConfig.numCongruent, this.numTrials / 2);

        this.counterbalance = config.counterBalanceGroups[config.counterbalanceNumber] as number;

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    async start() {
        this.taskData = [];
        this.currentStimuliIndex = 0;

        // either the stimuli has been defined in config or we generate it here from service
        if (!this.stimuli) {
            this.stimuli = this.dataGenService.generateStroopStimuli(this.numTrials, this.numCongruent);
        }
        super.start();
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.showStimulus = false;
        this.showFixation = true;
        this.scoreForSpecificTrial = 0;
        await wait(this.durationFixationPresented);
        if (this.isDestroyed) return;
        this.showFixation = false;

        this.setStimuliUI(this.currentStimulus);

        this.taskData.push({
            userID: this.userID,
            trial: ++this.trialNum,
            actualAnswer: this.currentStimulus.color.toUpperCase() as UserResponse,
            userAnswer: UserResponse.NA,
            isCongruent: this.color === this.text,
            responseTime: 0,
            isCorrect: false,
            score: 0,
            submitted: this.timerService.getCurrentTimestamp(),
            isPractice: this.isPractice,
            studyId: this.studyId,
        });

        this.setTimer(this.maxResponseTime, () => {
            this.showStimulus = false;
            this.responseAllowed = false;
            this.handleRoundInteraction(null);
        });

        this.timerService.startTimer();
        this.showStimulus = true;
        this.responseAllowed = true;
    }

    private setStimuliUI(stimulus: StroopStimulus) {
        this.text = stimulus.word;
        this.color = stimulus.color;
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
        return key === Key.NUMONE || key === Key.NUMTWO || key === Key.NUMTHREE;
    }

    getTranslationMapping(color: string): string {
        const language = this.translateService.currentLang;
        if (language === SupportedLangs.FR) {
            return this.translationMap[color];
        } else {
            return color;
        }
    }

    @HostListener('window:keypress', ['$event'])
    handleRoundInteraction(event: KeyboardEvent) {
        const thisTrial = this.taskData[this.taskData.length - 1];
        thisTrial.submitted = this.timerService.getCurrentTimestamp();
        if (this.responseAllowed && this.isValidKey(event.key)) {
            this.cancelAllTimers();
            this.responseAllowed = false;

            thisTrial.responseTime = this.timerService.stopTimerAndGetTime();

            switch (event.key) {
                case Key.NUMONE:
                    thisTrial.userAnswer = UserResponse.RED;
                    break;
                case Key.NUMTWO:
                    thisTrial.userAnswer = UserResponse.BLUE;
                    break;
                case Key.NUMTHREE:
                    thisTrial.userAnswer = UserResponse.GREEN;
                    break;
                default:
                    throw new Error('invalid user input received');
            }
            super.handleRoundInteraction(thisTrial.userAnswer);
        } else if (event === null) {
            this.cancelAllTimers();
            // max time out
            thisTrial.userAnswer = UserResponse.NA;
            thisTrial.score = 0;
            thisTrial.responseTime = this.maxResponseTime;
            thisTrial.isCorrect = false;
            super.handleRoundInteraction(null);
        }
    }

    async completeRound() {
        this.showStimulus = false;
        this.showFixation = false;
        this.responseAllowed = false;

        const thisTrial = this.taskData[this.taskData.length - 1];

        switch (thisTrial.userAnswer) {
            case thisTrial.actualAnswer:
                this.feedback = TranslatedFeedback.CORRECT;
                thisTrial.isCorrect = true;
                thisTrial.score = 10;

                this.scoreForSpecificTrial = 10;
                break;
            case UserResponse.NA:
                this.feedback = TranslatedFeedback.TOOSLOW;
                break;
            default:
                this.feedback = TranslatedFeedback.INCORRECT;
                thisTrial.isCorrect = false;
                thisTrial.score = 0;
                this.scoreForSpecificTrial = 0;
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
            this.config.setCacheValue(StroopCache.TOTAL_SCORE, totalScore);
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
