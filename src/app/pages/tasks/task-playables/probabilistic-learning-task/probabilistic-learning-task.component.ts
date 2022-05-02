import { Component, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getRandomNumber, thisOrDefault, throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { StimuliProvidedType } from 'src/app/models/enums';
import { Key, TranslatedFeedback, UserResponse } from 'src/app/models/InternalDTOs';
import { PLTTaskData } from 'src/app/models/TaskData';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { PLTStimulus } from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../base-task';
import { TaskPlayerState } from '../task-player/task-player.component';

interface PLTMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        phase: 'practice-phase' | 'training-phase' | 'test-phase';
        interTrialDelay: number;
        durationFeedbackPresented: number;
        durationFixationJitteredLowerBound: number;
        durationFixationJitteredUpperBound: number;
        showFeedbackAfterEachTrial: boolean;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: PLTStimulus[];
        };
    };
}

@Component({
    selector: 'app-probabilistic-learning-task',
    templateUrl: './probabilistic-learning-task.component.html',
    styleUrls: ['./probabilistic-learning-task.component.scss'],
})
export class ProbabilisticLearningTaskComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves learning via different pairs of stimuli.
     * In the practice phase, we practice using one pair to give an idea for how this works. One stimulus is presented on the left, and
     * one stimulus is presented on the right. The user should choose the one that gives them more points
     *
     * In the training phase, we have three pairs of logos. Each pair is presented with one being more likely to give a reward than the other.
     *
     * In the test phase, we have 11 pairs of logos. The 3 pairs from the training phase recombined. There will always be one that is more likely than
     * the others, and we want to test how well the participant has learned the reward from the training phase even in novel combinations.
     */

    // config variables variables
    isPractice: boolean = false;
    private phase: 'practice-phase' | 'training-phase' | 'test-phase';
    private showFeedbackAfterEachTrial: boolean;
    private maxResponseTime: number;
    private interTrialDelay: number; // In milliseconds
    private durationFeedbackPresented: number; // how long the points show for
    private durationFixationJitteredLowerBound: number;
    private durationFixationJitteredUpperBound: number;

    // high level variables
    taskData: PLTTaskData[];
    stimuli: PLTStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    feedback: string;
    shouldShowStimulus: boolean = false;
    leftStimulusShownPath: string = '';
    rightStimulusShownPath: string = '';
    showFeedback: boolean = false;
    showFixation: boolean = false;
    trialNum: number = 0;
    trialScore: number = 0;
    responseAllowed: boolean = false;

    // timers
    maxResponseTimer: any;

    get currentStimulus(): PLTStimulus {
        return this.stimuli[this.currentStimuliIndex];
    }

    get currentTrial(): PLTTaskData {
        return this.taskData[this.taskData.length - 1];
    }

    constructor(
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService,
        protected translateService: TranslateService
    ) {
        super(loaderService);
    }

    configure(metadata: PLTMetadata, config?: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');
            this.phase = throwErrIfNotDefined(metadata.componentConfig.phase, 'phase is not defined');
            this.maxResponseTime = throwErrIfNotDefined(
                metadata.componentConfig.maxResponseTime,
                'max response time not defined'
            );
        } catch (error) {
            throw new Error(error);
        }

        this.isPractice = thisOrDefault(metadata.componentConfig.isPractice, false);
        this.durationFeedbackPresented = thisOrDefault(metadata.componentConfig.durationFeedbackPresented, 500);
        this.interTrialDelay = thisOrDefault(metadata.componentConfig.interTrialDelay, 0);
        this.durationFixationJitteredLowerBound = thisOrDefault(
            metadata.componentConfig.durationFixationJitteredLowerBound,
            300
        );
        this.showFeedbackAfterEachTrial = thisOrDefault(metadata.componentConfig.showFeedbackAfterEachTrial, false);
        this.durationFixationJitteredUpperBound = thisOrDefault(
            metadata.componentConfig.durationFixationJitteredUpperBound,
            800
        );

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    async start() {
        this.taskData = [];
        this.currentStimuliIndex = 0;

        // either the stimuli have been defined in config or we generate it here from service
        if (!this.stimuli) this.stimuli = this.dataGenService.generatePLTStimuli(this.phase);
        super.start();
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.showFeedback = false;
        this.showFixation = false;
        this.leftStimulusShownPath = '';
        this.rightStimulusShownPath = '';
        this.shouldShowStimulus = false;
        this.responseAllowed = false;
        this.trialScore = 0;

        this.taskData.push({
            responseTime: 0,
            submitted: this.timerService.getCurrentTimestamp(),
            userID: this.userID,
            studyId: this.studyId,
            score: this.trialScore,
            trial: ++this.trialNum,
            phase: this.phase,
            leftStimulusPresented: this.currentStimulus.leftStimulusName,
            rightStimulusPresented: this.currentStimulus.rightStimulusName,
            isPractice: this.isPractice,
            isCorrect: false,
            correctSide: this.currentStimulus.leftOrRightCorrect,
            correctStimulus: this.currentStimulus.correctStimulusName,
            userAnswer: null,
            actualAnswer: this.currentStimulus.leftOrRightCorrect === 'LEFT' ? Key.Z : Key.M,
        });

        // show fixation
        this.showFixation = true;
        await wait(getRandomNumber(this.durationFixationJitteredLowerBound, this.durationFixationJitteredUpperBound));
        if (this.isDestroyed) return;
        this.showFixation = false;

        this.setStimuliUI(this.currentStimulus);

        this.timerService.startTimer();

        this.setTimer('maxResponseTimer', this.maxResponseTime, () => {
            this.responseAllowed = false;
            this.handleRoundInteraction(null);
        });
    }

    private setStimuliUI(stimulus: PLTStimulus) {
        this.leftStimulusShownPath = `${stimulus.leftStimulusName}.png`;
        this.rightStimulusShownPath = `${stimulus.rightStimulusName}.png`;
        this.shouldShowStimulus = true;
        this.responseAllowed = true;
    }

    private setTimer(timerType: 'showStimulusTimer' | 'maxResponseTimer', delay: number, cbFunc?: () => void) {
        if (timerType === 'maxResponseTimer') {
            this.maxResponseTimer = setTimeout(() => {
                if (cbFunc) cbFunc();
            }, delay);
        } else {
            throw new Error('Invalid Timer type, could not set timer');
        }
    }

    private cancelAllTimers() {
        clearTimeout(this.maxResponseTimer);
    }

    @HostListener('window:keypress', ['$event'])
    handleRoundInteraction(event: KeyboardEvent): void {
        const thisTrial = this.taskData[this.taskData.length - 1];
        thisTrial.submitted = this.timerService.getCurrentTimestamp();
        if (this.responseAllowed && this.isValidKey(event.key)) {
            this.cancelAllTimers();
            this.responseAllowed = false;

            thisTrial.userAnswer = event.key as Key;
            thisTrial.responseTime = this.timerService.stopTimerAndGetTime();

            super.handleRoundInteraction(event.key);
        } else if (event === null) {
            this.cancelAllTimers();
            // we reached max response time
            thisTrial.responseTime = this.maxResponseTime;
            thisTrial.userAnswer = UserResponse.NA;
            thisTrial.isCorrect = false;
            thisTrial.score = 0;
            super.handleRoundInteraction(null);
        }
    }

    private isValidKey(key: string): boolean {
        const caseInsensitiveKey = key.toLocaleLowerCase();
        return caseInsensitiveKey === Key.Z || caseInsensitiveKey === Key.M;
    }

    async completeRound() {
        this.shouldShowStimulus = false;
        this.showFixation = false;
        this.responseAllowed = false;

        const thisTrial = this.taskData[this.taskData.length - 1];

        switch (thisTrial.userAnswer) {
            case thisTrial.actualAnswer:
                this.feedback = `${this.TRANSLATION_PREFIX}${TranslatedFeedback.CORRECT}`;
                thisTrial.isCorrect = true;
                thisTrial.score = 10;
                break;
            case UserResponse.NA:
                this.feedback = `${this.TRANSLATION_PREFIX}${TranslatedFeedback.TOOSLOW}`;
                break;
            default:
                this.feedback = `${this.TRANSLATION_PREFIX}${TranslatedFeedback.INCORRECT}`;
                thisTrial.isCorrect = false;
                thisTrial.score = 0;
                break;
        }

        this.trialScore = thisTrial.score;

        if (
            this.showFeedbackAfterEachTrial ||
            this.feedback === `${this.TRANSLATION_PREFIX}${TranslatedFeedback.TOOSLOW}`
        ) {
            this.showFeedback = true;
            await wait(this.durationFeedbackPresented);
            if (this.isDestroyed) return;
            this.showFeedback = false;
        }

        super.completeRound();
    }

    async decideToRepeat() {
        const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1;

        if (finishedLastStimulus) {
            super.decideToRepeat();
            console.log(this.taskData);

            return;
        } else {
            this.currentStimuliIndex++;
            await wait(this.interTrialDelay);
            if (this.isDestroyed) return;
            this.beginRound();
            return;
        }
    }

    ngOnDestroy(): void {
        this.cancelAllTimers();
        super.ngOnDestroy();
    }
}
