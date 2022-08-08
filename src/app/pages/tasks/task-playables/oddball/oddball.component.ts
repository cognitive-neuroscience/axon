import { Component, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { getRandomNumber, throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { StimuliProvidedType } from 'src/app/models/enums';
import { Key, TranslatedFeedback, UserResponse } from 'src/app/models/InternalDTOs';
import { OddballTaskData } from 'src/app/models/TaskData';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { OddballTargetStimulus } from 'src/app/services/data-generation/raw-data/oddball-image-list';
import { OddballStimulus } from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../base-task';
import { TaskPlayerState } from '../task-player/task-player.component';

export interface OddballTaskMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        showFeedbackAfterEachTrial: boolean;
        durationOfFeedback: number;
        durationStimulusPresented: number;
        durationFixationJitteredLowerBound: number;
        durationFixationJitteredUpperBound: number;
        numTrials: number;
        numTargetTrials: number;
        numNovelStimuli: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: OddballStimulus[];
        };
    };
}

export enum OddballTaskCounterbalance {
    M = Key.M,
    Z = Key.Z,
}

enum OddballCache {
    NOVEL_STIMULI = 'oddball-novel-stimuli',
    BLOCK_NUM = 'oddball-block-num',
}

@Component({
    selector: 'app-oddball',
    templateUrl: './oddball.component.html',
    styleUrls: ['./oddball.component.scss'],
})
export class OddballComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task is split into multiple sections. The first is the normal oddball task, where images are display to the user
     * one at a time. When the target stimulus is displayed on the screen (a triangle at the time of writing this) then the
     * user will have to press the counterbalanced key (M or Z). Otherwise, the participant presses the other key to indicated
     * a non target stimulus.
     * In the second part of this task, random images are shown, but the samne rules apply. The participant must only press the
     * correct counterbalanced key for the target stimulus and theo ther key for all other stimuli.
     */

    // config variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number; // In milliseconds
    private showFeedbackAfterEachTrial: boolean;
    private durationOfFeedback: number;
    private durationStimulusPresented: number;
    private durationFixationJitteredLowerBound: number;
    private durationFixationJitteredUpperBound: number;
    private numTrials: number;
    private numTargetTrials: number;
    private numNovelStimuli: number;

    // high level variables
    taskData: OddballTaskData[];
    stimuli: OddballStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    studyLoaded: boolean = false; // because we make an initial async call. We don't want to show stuff until this has been completed
    stimulusShown: string | ArrayBuffer = null;
    blockNum: number = 0;
    feedback: string;
    showStimulus: boolean = false;
    showFeedback: boolean = false;
    showFixation: boolean = false;
    trialNum: number = 0;
    counterbalance: OddballTaskCounterbalance;
    responseAllowed: boolean = false;

    // timers
    maxResponseTimer: any;
    showStimulusTimer: any;

    get currentTrial(): OddballTaskData {
        // will return null if taskData is not defined or if it has length of 0
        return this.taskData?.length > 0 ? this.taskData[this.taskData.length - 1] : null;
    }

    get currentStimulus(): OddballStimulus {
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

    configure(metadata: OddballTaskMetadata, config: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.durationFixationJitteredLowerBound = throwErrIfNotDefined(
                metadata.componentConfig.durationFixationJitteredLowerBound,
                'no jitter lower bound found'
            );
            this.durationFixationJitteredUpperBound = throwErrIfNotDefined(
                metadata.componentConfig.durationFixationJitteredUpperBound,
                'no jitter upper bound found'
            );
            this.numTrials = throwErrIfNotDefined(metadata.componentConfig.numTrials, 'num trials not defined');
            this.numTargetTrials = throwErrIfNotDefined(
                metadata.componentConfig.numTargetTrials,
                'num target trials not defined'
            );
            this.numNovelStimuli = throwErrIfNotDefined(
                metadata.componentConfig.numNovelStimuli,
                'num novel stimuli not defined'
            );
            this.durationStimulusPresented = throwErrIfNotDefined(
                metadata.componentConfig.durationStimulusPresented,
                'duration stimulus presented not defined'
            );
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }

        this.config = config;
        this.isPractice = metadata.componentConfig.isPractice || false;
        this.interTrialDelay = metadata.componentConfig.interTrialDelay || 0;

        this.maxResponseTime = metadata.componentConfig.maxResponseTime || undefined;

        this.showFeedbackAfterEachTrial = metadata.componentConfig.showFeedbackAfterEachTrial || false;
        this.durationOfFeedback = metadata.componentConfig.durationOfFeedback || 0;

        this.counterbalance = config.counterBalanceGroups[config.counterbalanceNumber] as OddballTaskCounterbalance;

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    async start() {
        this.studyLoaded = false;
        this.taskData = [];
        this.currentStimuliIndex = 0;
        this.blockNum = this.config.getCacheValue(OddballCache.BLOCK_NUM) || 1; // set to 1 if not defined

        // either the stimuli has been defined in config or we generate it here in an observable
        if (!this.stimuli) {
            const cachedNovelStimuli = (this.config.getCacheValue(OddballCache.NOVEL_STIMULI) || []) as string[];
            this.dataGenService
                .generateOddballData(this.numTargetTrials, this.numNovelStimuli, this.numTrials, cachedNovelStimuli)
                .pipe(take(1))
                .subscribe((stimuli) => {
                    this.studyLoaded = true;
                    this.stimuli = stimuli;

                    // if we are using novel stimuli, we have to cache them so that we don't repeat any
                    this.config.setCacheValue(OddballCache.NOVEL_STIMULI, cachedNovelStimuli);
                    super.start();
                });
        } else {
            super.start();
        }
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.showStimulus = false;

        const targetResponseKey = this.counterbalance === OddballTaskCounterbalance.M ? Key.M : Key.Z;
        const nonTargetResponseKey = this.counterbalance === OddballTaskCounterbalance.M ? Key.Z : Key.M;

        this.taskData.push({
            userID: this.userID,
            stimulus: this.currentStimulus.stimulus,
            targetResponse: targetResponseKey,
            responseTime: 0,
            trial: ++this.trialNum,
            isCorrect: false,
            score: 0,
            userAnswer: UserResponse.NA,
            actualAnswer: this.currentStimulus.isTarget ? targetResponseKey : nonTargetResponseKey,
            submitted: this.timerService.getCurrentTimestamp(),
            isPractice: this.isPractice,
            studyId: this.studyId,
            target: OddballTargetStimulus,
            block: this.blockNum,
        });

        this.setStimuliUI(this.currentStimulus);

        // wait jittered interval
        this.showFixation = true;
        await wait(getRandomNumber(this.durationFixationJitteredLowerBound, this.durationFixationJitteredUpperBound));
        if (this.isDestroyed) return;
        this.showFixation = false;

        this.timerService.startTimer();
        this.showStimulus = true;
        this.responseAllowed = true;

        this.setTimer('showStimulusTimer', this.durationStimulusPresented, () => {
            this.showStimulus = false;
            return;
        });

        this.setTimer('maxResponseTimer', this.maxResponseTime, async () => {
            this.responseAllowed = false;
            this.handleRoundInteraction(null);
        });
    }

    private setStimuliUI(stimulus: OddballStimulus) {
        this.showImage(stimulus.blob);
    }

    /**
     * We want to update the trial with the response time and user response.
     * When we receive null as an arg (meaning that the maxResponseTime has been reached)
     * then we know to complete.
     */
    @HostListener('window:keypress', ['$event'])
    handleRoundInteraction(event: KeyboardEvent) {
        if (this.currentTrial?.submitted) {
            this.currentTrial.submitted = this.timerService.getCurrentTimestamp();
            const caseInsensitiveKey = event?.key ? event.key.toLocaleLowerCase() : null;
            if (this.responseAllowed && this.isValidKey(caseInsensitiveKey)) {
                this.cancelAllTimers();
                this.responseAllowed = false;

                this.currentTrial.userAnswer = caseInsensitiveKey;
                this.currentTrial.responseTime = this.timerService.stopTimerAndGetTime();

                super.handleRoundInteraction(event);
            } else if (event === null) {
                this.cancelAllTimers();
                // we reached max response time
                this.currentTrial.responseTime = this.maxResponseTime;
                this.currentTrial.userAnswer = UserResponse.NA;
                this.currentTrial.isCorrect = false;
                this.currentTrial.score = 0;
                super.handleRoundInteraction(null);
            }
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
                break;
            case UserResponse.NA:
                this.feedback = TranslatedFeedback.TOOSLOW;
                break;
            default:
                this.feedback = TranslatedFeedback.INCORRECT;
                thisTrial.isCorrect = false;
                thisTrial.score = 0;
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
            this.config.setCacheValue(OddballCache.BLOCK_NUM, this.isPractice ? this.blockNum : ++this.blockNum);
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

    breakDuration: number = 31;

    private isValidKey(key: string): boolean {
        return key === Key.Z || key === Key.M;
    }

    private cancelAllTimers() {
        this.snackbarService.clearSnackbar();
        clearTimeout(this.maxResponseTimer);
        clearTimeout(this.showStimulusTimer);
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

    private showImage(blob: Blob) {
        const fr = new FileReader();
        fr.addEventListener('load', () => {
            this.stimulusShown = fr.result;
        });
        fr.readAsDataURL(blob);
    }
}
