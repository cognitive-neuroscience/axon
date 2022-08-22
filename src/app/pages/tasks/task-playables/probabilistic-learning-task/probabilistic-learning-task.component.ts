import { Component, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getRandomNumber, shuffle, thisOrDefault, throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { StimuliProvidedType } from 'src/app/models/enums';
import { Key, TranslatedFeedback, UserResponse } from 'src/app/models/InternalDTOs';
import { PLTTaskData } from 'src/app/models/TaskData';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { PLTStimulus, PLTStimulusType } from 'src/app/services/data-generation/stimuli-models';
import { ImageService } from 'src/app/services/image.service';
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

interface PLTImageStimuliMap {
    [PLTStimulusType.STIM80]: string;
    [PLTStimulusType.STIM70]: string;
    [PLTStimulusType.STIM60]: string;
    [PLTStimulusType.STIM40]: string;
    [PLTStimulusType.STIM30]: string;
    [PLTStimulusType.STIM20]: string;
    [PLTStimulusType.PRACTICESTIM80]: string;
    [PLTStimulusType.PRACTICESTIM20]: string;
}

export enum PLTCache {
    IMAGE_STIMULI_MAPPING = 'plt-image-stimuli-mapping',
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

    // cache
    imageStimuliMap: PLTImageStimuliMap;

    // local state variables
    keyPressed: string = '';
    feedback: string;
    shouldShowStimulus: boolean = false;
    leftStimulusShown: string | ArrayBuffer = null;
    rightStimulusShown: string | ArrayBuffer = null;
    showFeedback: boolean = false;
    showFixation: boolean = false;
    trialNum: number = 0;
    trialScore: number = 0;
    responseAllowed: boolean = false;

    imageBlobMap: { [key: string]: Blob } = {};

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
        protected translateService: TranslateService,
        protected imageService: ImageService
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

        this.config = config;
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
        this.loaderService.showLoader();
        this.subscriptions.push(
            this.imageService
                .loadImagesAsBlobs([
                    '/assets/images/stimuli/plt/image1.jpg',
                    '/assets/images/stimuli/plt/image2.jpg',
                    '/assets/images/stimuli/plt/image3.jpg',
                    '/assets/images/stimuli/plt/image4.jpg',
                    '/assets/images/stimuli/plt/image5.jpg',
                    '/assets/images/stimuli/plt/image6.jpg',
                    '/assets/images/stimuli/plt/practiceImage1.jpg',
                    '/assets/images/stimuli/plt/practiceImage2.jpg',
                ])
                .subscribe(
                    (blobs) => {
                        this.imageBlobMap = {
                            image1: blobs[0],
                            image2: blobs[1],
                            image3: blobs[2],
                            image4: blobs[3],
                            image5: blobs[4],
                            image6: blobs[5],
                            practiceImage1: blobs[6],
                            practiceImage2: blobs[7],
                        };

                        // if mapping does not exist, create it by randomly assigning images to stimuli
                        let mappingInCache = this.config.getCacheValue(PLTCache.IMAGE_STIMULI_MAPPING);
                        if (!mappingInCache) {
                            const imageList = shuffle(['image1', 'image2', 'image3', 'image4', 'image5', 'image6']);
                            let mapping: PLTImageStimuliMap = {
                                [PLTStimulusType.STIM80]: imageList.pop(),
                                [PLTStimulusType.STIM70]: imageList.pop(),
                                [PLTStimulusType.STIM60]: imageList.pop(),
                                [PLTStimulusType.STIM40]: imageList.pop(),
                                [PLTStimulusType.STIM30]: imageList.pop(),
                                [PLTStimulusType.STIM20]: imageList.pop(),
                                [PLTStimulusType.PRACTICESTIM80]: 'practiceImage1',
                                [PLTStimulusType.PRACTICESTIM20]: 'practiceImage2',
                            };
                            mappingInCache = mapping;
                            this.config.setCacheValue(PLTCache.IMAGE_STIMULI_MAPPING, mapping);
                        }
                        this.imageStimuliMap = mappingInCache;

                        super.start();
                    },
                    (_err) => {
                        throw new Error('there was an error getting images');
                    }
                )
                .add(() => {
                    this.loaderService.hideLoader();
                })
        );
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.showFeedback = false;
        this.showFixation = false;
        this.leftStimulusShown = null;
        this.rightStimulusShown = null;
        this.shouldShowStimulus = false;
        this.responseAllowed = false;
        this.trialScore = 0;

        this.taskData.push({
            score: 0,
            trial: ++this.trialNum,
            submitted: this.timerService.getCurrentTimestamp(),
            userID: this.userID,
            studyId: this.studyId,
            isPractice: this.isPractice,
            phase: this.phase,
            leftStimulusPresented: this.currentStimulus.leftStimulusName,
            leftImageFileName: this.imageStimuliMap[this.currentStimulus.leftStimulusName],
            rightStimulusPresented: this.currentStimulus.rightStimulusName,
            rightImageFileName: this.imageStimuliMap[this.currentStimulus.rightStimulusName],
            selectedStimulus: null,
            selectedStimulusImageFileName: null,
            selectedStimulusWasRewarded: false,
            expectedStimulus: this.currentStimulus.expectedSelectedStimulus,
            expectedStimulusImageFileName: this.imageStimuliMap[this.currentStimulus.expectedSelectedStimulus],
            userAnswer: UserResponse.NA,
            expectedAnswer:
                this.currentStimulus.expectedSelectedStimulus === this.currentStimulus.leftStimulusName ? Key.Z : Key.M,
            userAnswerIsExpectedAnswer: false,
            responseTime: 0,
        });

        // show fixation
        this.showFixation = true;
        await wait(getRandomNumber(this.durationFixationJitteredLowerBound, this.durationFixationJitteredUpperBound));
        if (this.isDestroyed) return;
        this.showFixation = false;

        this.setStimuliUI(this.currentStimulus);

        this.timerService.startTimer();

        this.setTimer(this.maxResponseTime, () => {
            this.handleRoundInteraction(null);
        });
    }

    private setStimuliUI(stimulus: PLTStimulus) {
        const leftImage = this.imageBlobMap[this.imageStimuliMap[stimulus.leftStimulusName]];
        const rightImage = this.imageBlobMap[this.imageStimuliMap[stimulus.rightStimulusName]];
        this.showLeftImage(leftImage);
        this.showRightImage(rightImage);
        this.shouldShowStimulus = true;
        this.responseAllowed = true;
    }

    private setTimer(delay: number, cbFunc?: () => void) {
        this.maxResponseTimer = setTimeout(() => {
            if (cbFunc) cbFunc();
        }, delay);
    }

    private cancelAllTimers() {
        clearTimeout(this.maxResponseTimer);
    }

    @HostListener('window:keypress', ['$event'])
    async handleRoundInteraction(event: KeyboardEvent | null) {
        if (!this.responseAllowed) return;

        this.currentTrial.submitted = this.timerService.getCurrentTimestamp();
        const caseInsensitiveKey = event?.key?.toLocaleLowerCase();
        if (this.isValidKey(caseInsensitiveKey)) {
            this.cancelAllTimers();
            this.responseAllowed = false;

            // show highlighted border
            this.keyPressed = caseInsensitiveKey;
            await wait(600);
            this.keyPressed = '';

            this.currentTrial.userAnswer = caseInsensitiveKey as Key;
            this.currentTrial.userAnswerIsExpectedAnswer = caseInsensitiveKey === this.currentTrial.expectedAnswer;
            this.currentTrial.responseTime = this.timerService.stopTimerAndGetTime();

            this.currentTrial.selectedStimulus =
                caseInsensitiveKey === Key.Z
                    ? this.currentTrial.leftStimulusPresented
                    : this.currentTrial.rightStimulusPresented;
            this.currentTrial.selectedStimulusImageFileName =
                caseInsensitiveKey === Key.Z
                    ? this.currentTrial.leftImageFileName
                    : this.currentTrial.rightImageFileName;

            super.handleRoundInteraction(caseInsensitiveKey);
        } else if (event === null) {
            this.cancelAllTimers();
            // we reached max response time
            this.currentTrial.responseTime = this.maxResponseTime;
            this.currentTrial.userAnswer = UserResponse.NA;
            this.currentTrial.selectedStimulusWasRewarded = false;
            this.currentTrial.score = 0;
            super.handleRoundInteraction(null);
        }
    }

    private isValidKey(key: string): boolean {
        if (!key) return false;

        return key === Key.Z || key === Key.M;
    }

    async completeRound() {
        this.shouldShowStimulus = false;
        this.leftStimulusShown = null;
        this.rightStimulusShown = null;
        this.showFixation = false;
        this.responseAllowed = false;

        switch (this.currentTrial.userAnswer) {
            case UserResponse.NA:
                this.feedback = TranslatedFeedback.TOOSLOW;
                break;
            case this.currentTrial.expectedAnswer:
            default:
                if (
                    (this.currentTrial.userAnswer === Key.Z && this.currentStimulus.leftStimulusRewarded) ||
                    (this.currentTrial.userAnswer === Key.M && this.currentStimulus.rightStimulusRewarded)
                ) {
                    this.feedback = TranslatedFeedback.CORRECT;
                    this.currentTrial.selectedStimulusWasRewarded = true;
                    this.currentTrial.score = 10;
                } else {
                    this.feedback = TranslatedFeedback.INCORRECT;
                    this.currentTrial.selectedStimulusWasRewarded = false;
                    this.currentTrial.score = 0;
                }
                break;
        }

        this.trialScore = this.currentTrial.score;

        if (this.showFeedbackAfterEachTrial || this.feedback === TranslatedFeedback.TOOSLOW) {
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

    private showLeftImage(blob: Blob) {
        const fr = new FileReader();
        fr.addEventListener('load', () => {
            this.leftStimulusShown = fr.result;
        });
        fr.readAsDataURL(blob);
    }

    private showRightImage(blob: Blob) {
        const fr = new FileReader();
        fr.addEventListener('load', () => {
            this.rightStimulusShown = fr.result;
        });
        fr.readAsDataURL(blob);
    }

    ngOnDestroy(): void {
        this.cancelAllTimers();
        super.ngOnDestroy();
    }
}
