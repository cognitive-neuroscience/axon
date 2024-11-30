import { Component } from '@angular/core';
import { throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { StimuliProvidedType } from 'src/app/models/enums';
import { TranslatedFeedback, UserResponse } from 'src/app/models/InternalDTOs';
import { FaceNameAssociationTaskData } from 'src/app/models/ParticipantData';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import {
    FaceNameAssociationStimulus,
    FaceNameAssociationTaskTrialtype,
} from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { TimerService } from 'src/app/services/timer.service';
import { AttentionCheckCache } from '../attention-check/attention-check.component';
import { AbstractBaseTaskComponent } from '../base-task';
import { TaskPlayerState } from '../task-player/task-player.component';

interface FaceNameAssociationMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        phase: 'learning-phase' | 'test-phase';
        maxResponseTime: number;
        interTrialDelay: number;
        durationStimulusPresented: number;
        blockNum: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: FaceNameAssociationStimulus[];
        };
    };
}

export enum FaceNameAssociationCache {
    STIMULI = 'facenameassociation-stimuli',
}

@Component({
    selector: 'app-face-name-association',
    templateUrl: './face-name-association.component.html',
    styleUrls: ['./face-name-association.component.scss'],
})
export class FaceNameAssociationComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves two phases. In the first phase, the participant sees a bunch of images and associated names. This is the learning phase.
     * In the second phase, the participant is tested on the images. Half of them are correct, and are half of them are recombined.
     *
     * The face images are taken from a set number of images, and names are automatically (and randomly) assigned depending on the counterbalance.
     */

    // config variables
    isPractice: boolean = true;
    phase: 'learning-phase' | 'test-phase' = 'learning-phase';
    private maxResponseTime = 10000;
    private stimulusSet = 1;
    private interTrialDelay = 500;
    private durationStimulusPresented = 3000;
    private durationOfFeedback = 1000;
    private counterbalance: 1 | 2;
    private blockNum: number;

    // high level variables
    taskData: FaceNameAssociationTaskData[];
    stimuli: FaceNameAssociationStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    trialNum = 0;
    currentName = '';
    stimulusShown = '';
    showStimulus = false;
    allowResponse = false;
    blobs: { [key: string]: Blob } = {};
    feedback: string = '';
    showFeedback: boolean = false;
    imagePath: string = '';

    YES = UserResponse.YES;
    NO = UserResponse.NO;

    // timers
    maxResponseTimer: any;

    get currentStimulus(): FaceNameAssociationStimulus {
        return this.stimuli[this.currentStimuliIndex];
    }

    get currentTrial(): FaceNameAssociationTaskData {
        return this.taskData[this.taskData.length - 1];
    }

    constructor(
        protected timerService: TimerService,
        protected loaderService: LoaderService,
        private dataGenService: DataGenerationService
    ) {
        super(loaderService);
    }

    configure(metadata: FaceNameAssociationMetadata, config?: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.maxResponseTime = throwErrIfNotDefined(
                metadata.componentConfig.maxResponseTime,
                'max response time not defined'
            );

            this.durationStimulusPresented = throwErrIfNotDefined(
                metadata.componentConfig.durationStimulusPresented,
                'duration stimulus presented not defined'
            );

            this.config = config;

            this.phase = throwErrIfNotDefined(metadata.componentConfig.phase, 'phase not defined');
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }
        this.isPractice = metadata.componentConfig.isPractice;
        this.interTrialDelay = metadata.componentConfig.interTrialDelay || 500;
        this.durationStimulusPresented = metadata.componentConfig.durationStimulusPresented || 3000;
        this.counterbalance = throwErrIfNotDefined(
            config.counterBalanceGroups[config.counterbalanceNumber] as 1 | 2,
            'counterbalance not defined'
        );
        this.stimulusSet = this.counterbalance;
        this.blockNum = metadata.componentConfig.blockNum || 1;

        if (config.getCacheValue(FaceNameAssociationCache.STIMULI)) {
            this.stimuli = config.getCacheValue(FaceNameAssociationCache.STIMULI) as FaceNameAssociationStimulus[];
        } else if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED) {
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
        }
    }

    async start() {
        this.taskData = [];
        this.currentStimuliIndex = 0;
        this.trialNum = 0;

        this.stimuli = this.dataGenService.generateFaceNameAssociationTaskStimuli(
            this.phase,
            this.counterbalance,
            this.stimuli
        );
        if (!this.config.getCacheValue(FaceNameAssociationCache.STIMULI)) {
            // store in cache for next block
            this.config.setCacheValue(FaceNameAssociationCache.STIMULI, this.stimuli);
        }

        this.stimuli.forEach((stimulus) => {
            this.preload(stimulus.imagePath);
        });

        super.start();
    }

    private preload(url: string) {
        const img = new Image();
        img.src = url;
    }

    private getActualAnswer(stimulus: FaceNameAssociationStimulus): UserResponse {
        if (this.phase === 'learning-phase') {
            return UserResponse.NA;
        } else {
            return stimulus.trialType === FaceNameAssociationTaskTrialtype.INTACT ? UserResponse.YES : UserResponse.NO;
        }
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.showStimulus = false;
        this.allowResponse = false;
        this.currentName = '';

        const attentionCheckAnswers: string = (
            (this.config.getCacheValue(AttentionCheckCache.USER_ANSWERS) as string[]) || []
        ).reduce((acc, curr, index) => (index === 0 ? curr : `${acc}, ${curr}`), '');

        this.taskData.push({
            userID: this.userID,
            studyId: this.studyId,
            isPractice: this.isPractice,
            trial: ++this.trialNum,
            phase: this.phase,
            imagePresented: this.currentStimulus.imageName,
            namePresented: this.currentStimulus.displayedPersonName,
            actualName: this.currentStimulus.actualPersonName,
            stimulusSet: this.stimulusSet,
            gender: this.currentStimulus.gender,
            trialType: this.currentStimulus.trialType,
            userAnswer: UserResponse.NA,
            isCorrect: false,
            actualAnswer: this.getActualAnswer(this.currentStimulus),
            responseTime: 0,
            blockNum: this.blockNum,
            submitted: this.timerService.getCurrentTimestamp(),
            attentionCheck: attentionCheckAnswers,
        });

        if (this.phase === 'learning-phase') {
            this.setStimuliUI();
            this.showStimulus = true;
            await wait(this.durationStimulusPresented);
            this.showStimulus = false;
            this.handleRoundInteraction(null);
        } else {
            this.setStimuliUI();
            this.showStimulus = true;
            this.timerService.startTimer();
            this.allowResponse = true;
            this.setMaxResponseTimer(this.maxResponseTime, () => {
                this.handleRoundInteraction(null);
                this.allowResponse = false;
            });
        }
    }

    private async setStimuliUI() {
        this.currentName = this.currentStimulus.displayedPersonName;
        this.stimulusShown = this.currentStimulus.imagePath;
    }

    private setMaxResponseTimer(delay: number, cbFunc?: () => void) {
        this.maxResponseTimer = window.setTimeout(() => {
            if (cbFunc) cbFunc();
        }, delay);
    }

    private cancelAllTimers() {
        clearTimeout(this.maxResponseTimer);
    }

    private isValidResponse(response: UserResponse): boolean {
        return response === UserResponse.YES || response === UserResponse.NO;
    }

    handleRoundInteraction(response: UserResponse | null): void {
        this.showStimulus = false;
        this.currentTrial.submitted = this.timerService.getCurrentTimestamp();
        this.cancelAllTimers();

        /**
         * Either we have reached our max response time or we are in the
         * learning phase
         */
        if (response === null) {
            if (this.phase === 'test-phase') {
                this.currentTrial.responseTime = this.maxResponseTime;
            }
            this.currentTrial.userAnswer = UserResponse.NA;
            this.currentTrial.isCorrect = false;
            super.handleRoundInteraction(null);
        } else if (this.isValidResponse(response)) {
            this.currentTrial.responseTime = this.timerService.stopTimerAndGetTime();
            this.currentTrial.userAnswer = response;
            super.handleRoundInteraction(response);
        }
    }

    async completeRound() {
        this.showStimulus = false;
        this.feedback = '';
        this.showFeedback = false;
        this.allowResponse = false;

        switch (this.currentTrial.userAnswer) {
            case this.currentTrial.actualAnswer:
                this.currentTrial.isCorrect = true;
                break;
            case UserResponse.NA:
                this.feedback = TranslatedFeedback.TOOSLOW;
                break;
            default:
                this.currentTrial.isCorrect = false;
                break;
        }

        if (this.phase === 'test-phase' && this.feedback === TranslatedFeedback.TOOSLOW) {
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
