import { Component } from '@angular/core';
import { throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { StimuliProvidedType } from 'src/app/models/enums';
import { UserResponse } from 'src/app/models/InternalDTOs';
import { FaceNameAssociationTaskData } from 'src/app/models/TaskData';
import { ComponentName } from 'src/app/services/component-factory.service';
import {
    FaceNameAssociationStimulus,
    FaceNameAssociationTaskTrialtype,
} from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../base-task';
import { TaskConfig } from '../task-player/task-player.component';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { ImageService } from 'src/app/services/image.service';

interface FaceNameAssociationMetadata {
    component: ComponentName;
    config: {
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
    isPractice: boolean = false;
    private phase: 'learning-phase' | 'test-phase' = 'learning-phase';
    private maxResponseTime = 10000;
    private stimulusSet = 1;
    private interTrialDelay = 500;
    private durationStimulusPresented = 3000;

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

    // timers
    maxResponseTimer: any;
    stimulusPresentedTimer: any;

    get currentStimulus(): FaceNameAssociationStimulus {
        return this.stimuli[this.currentStimuliIndex];
    }

    constructor(
        protected timerService: TimerService,
        protected loaderService: LoaderService,
        private dataGenService: DataGenerationService,
        private imageService: ImageService
    ) {
        super(loaderService);
    }

    configure(metadata: FaceNameAssociationMetadata, config?: TaskConfig) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.maxResponseTime = throwErrIfNotDefined(
                metadata.config.maxResponseTime,
                'max response time not defined'
            );

            this.durationStimulusPresented = throwErrIfNotDefined(
                metadata.config.durationStimulusPresented,
                'duration stimulus presented not defined'
            );

            this.phase = throwErrIfNotDefined(metadata.config.phase, 'phase not defined');
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }
        this.isPractice = metadata.config.isPractice || true;
        this.stimulusSet = metadata.config.stimulusSet || 1;
        this.interTrialDelay = metadata.config.interTrialDelay || 500;
        this.durationStimulusPresented = metadata.config.durationStimulusPresented || 3000;

        if (metadata.config.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.config.stimuliConfig.stimuli;
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
            trial: this.trialNum,
            phase: this.phase,
            imagePresented: this.currentStimulus.imageName,
            namePresented: this.currentStimulus.personName,
            actualName: this.currentStimulus.correctPersonName,
            stimulusSet: this.stimulusSet,
            maleFemale: this.currentStimulus.isFemale ? 'female' : 'male',
            trialType: FaceNameAssociationTaskTrialtype.INTACT,
            userAnswer: UserResponse.NA,
            isCorrect: false,
            actualAnswer: UserResponse.NA,
            submitted: this.timerService.getCurrentTimestamp(),
        });

        this.setStimuliUI();
        console.log('set stimulus');

        this.showStimulus = true;
        await wait(this.durationStimulusPresented);
        this.showStimulus = false;
    }

    private setStimuliUI() {
        this.currentName = this.currentStimulus.personName;
        this.showImage(this.blobs[this.currentStimulus.imageName]);
    }

    completeRound(): void {}

    ngOnInit(): void {}

    private showImage(blob: Blob) {
        const fr = new FileReader();
        fr.addEventListener('load', () => {
            this.stimulusShown = fr.result;
        });
        fr.readAsDataURL(blob);
    }
}
