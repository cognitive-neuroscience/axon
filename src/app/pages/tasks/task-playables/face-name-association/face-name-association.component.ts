import { Component } from '@angular/core';
import { throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { StimuliProvidedType } from 'src/app/models/enums';
import { TranslatedFeedback, UserResponse } from 'src/app/models/InternalDTOs';
import { FaceNameAssociationTaskData } from 'src/app/models/TaskData';
import { ComponentName } from 'src/app/services/component-factory.service';
import {
    FaceNameAssociationStimulus,
    FaceNameAssociationTaskTrialtype,
} from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../base-task';
import { TaskPlayerState } from '../task-player/task-player.component';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { ImageService } from 'src/app/services/image.service';

interface FaceNameAssociationMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        phase: 'learning-phase' | 'test-phase';
        maxResponseTime: number;
        stimulusSet: number;
        interTrialDelay: number;
        durationStimulusPresented: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: FaceNameAssociationStimulus[];
        };
    };
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
     * The stimuli are hard coded.
     */

    // config variables
    isPractice: boolean = true;
    phase: 'learning-phase' | 'test-phase' = 'learning-phase';
    private maxResponseTime = 10000;
    private stimulusSet = 1;
    private interTrialDelay = 500;
    private durationStimulusPresented = 3000;
    private durationOfFeedback = 1000;

    // high level variables
    taskData: FaceNameAssociationTaskData[];
    stimuli: FaceNameAssociationStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    trialNum = 0;
    currentName = '';
    showStimulus = false;
    allowResponse = false;
    stimulusShown: string | ArrayBuffer = null;
    blobs: { [key: string]: Blob } = {};
    feedback: string = '';
    showFeedback: boolean = false;

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
        private dataGenService: DataGenerationService,
        private imageService: ImageService
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

            this.phase = throwErrIfNotDefined(metadata.componentConfig.phase, 'phase not defined');
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }
        this.isPractice = metadata.componentConfig.isPractice;
        this.stimulusSet = metadata.componentConfig.stimulusSet || 1;
        this.interTrialDelay = metadata.componentConfig.interTrialDelay || 500;
        this.durationStimulusPresented = metadata.componentConfig.durationStimulusPresented || 3000;

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    async start() {
        this.taskData = [];
        this.currentStimuliIndex = 0;
        this.trialNum = 0;

        if (!this.stimuli) {
            this.stimuli = this.dataGenService.generateFaceNameAssociationTaskStimuli(this.phase);
            const fileNames = this.stimuli.map((x) => `/assets/images/stimuli/facenameassociation/${x.imageName}.png`);
            this.imageService.loadImagesAsBlobs(fileNames).subscribe((res) => {
                res.forEach((blob, index) => {
                    const imageName = this.stimuli[index].imageName;
                    this.blobs[imageName] = blob;
                });
                super.start();
            });
        } else {
            super.start();
        }
    }

    private getActualAnswer(stimulus: FaceNameAssociationStimulus): UserResponse {
        if (this.phase === 'learning-phase') {
            return UserResponse.NA;
        } else {
            return stimulus.personName === stimulus.correctPersonName ? UserResponse.YES : UserResponse.NO;
        }
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.showStimulus = false;
        this.allowResponse = false;
        this.currentName = '';
        this.stimulusShown = null;

        this.taskData.push({
            userID: this.userID,
            studyId: this.studyId,
            isPractice: this.isPractice,
            trial: ++this.trialNum,
            phase: this.phase,
            imagePresented: this.currentStimulus.imageName,
            namePresented: this.currentStimulus.personName,
            actualName: this.currentStimulus.correctPersonName,
            stimulusSet: this.stimulusSet,
            maleFemale: this.currentStimulus.isFemale ? 'female' : 'male',
            trialType:
                this.currentStimulus.personName === this.currentStimulus.correctPersonName
                    ? FaceNameAssociationTaskTrialtype.INTACT
                    : FaceNameAssociationTaskTrialtype.RECOMBINED,
            userAnswer: UserResponse.NA,
            isCorrect: false,
            actualAnswer: this.getActualAnswer(this.currentStimulus),
            responseTime: 0,
            submitted: this.timerService.getCurrentTimestamp(),
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
        this.currentName = this.currentStimulus.personName;
        await this.showImage(this.blobs[this.currentStimulus.imageName]);
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

    private showImage(blob: Blob): Promise<void> {
        return new Promise((resolve) => {
            const fr = new FileReader();
            const handler = () => {
                this.stimulusShown = fr.result;
                fr.removeEventListener('load', handler);
                resolve();
            };
            fr.addEventListener('load', handler);
            fr.readAsDataURL(blob);
        });
    }
}
