import { Component, HostListener } from '@angular/core';
import { Color, Key, TranslatedFeedback, UserResponse } from 'src/app/models/InternalDTOs';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { TimerService } from 'src/app/services/timer.service';
import { DemandSelectionTaskData } from 'src/app/models/TaskData';
import { StimuliProvidedType } from 'src/app/models/enums';
import { ComponentName } from 'src/app/services/component-factory.service';
import {
    DemandSelectionCounterbalance,
    DemandSelectionStimulus,
} from 'src/app/services/data-generation/stimuli-models';
import { TaskPlayerState } from '../task-player/task-player.component';
import { AbstractBaseTaskComponent } from '../base-task';
import { thisOrDefault, throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { TranslateService } from '@ngx-translate/core';

interface DemandSelectionMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        showFeedbackAfterEachTrial: boolean;
        durationOfFeedback: number;
        numTrials: number;
        skippable: boolean;
        delayToShowHelpMessage: number;
        probOfShiftFirstPatch: number;
        setCounterBalancePatchStringInMemory: 'none' | 'counterbalance' | 'counterbalance-alternative';
        durationHelpMessageShown: number;
        probOfShiftSecondPatch: number;
        oddEvenColor: Color;
        ltGtColor: Color;
        counterbalanceMode: 'none' | 'counterbalance' | 'counterbalance-alternative';
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: DemandSelectionStimulus[];
        };
    };
}

export enum DemandSelectionCache {
    BLOCK_NUM = 'demandselection-block-num',
    USED_STIMS_ARRAY = 'demandselection-used-stims-array',
    NUM_CORRECT = 'demandselection-num-correct',
    PATCH_STRING_PRESENTED = 'demandselection-patch-string-presented',
    SHOULD_SKIP = 'demandselection-should-skip',
}

@Component({
    selector: 'app-demand-selection',
    templateUrl: './demand-selection.component.html',
    styleUrls: ['./demand-selection.component.scss'],
})
export class DemandSelectionComponent extends AbstractBaseTaskComponent {
    /**
     * This task is designed to be an addition to the task switching game.
     * The participant is shown 2 patches. For every block, new patches are
     * selected and the rotation changes.
     * The participant has to hover their mouse over the middle fixation. Once they
     * do that, then the two patches appear. One patch requires more frequent task switching
     * compared to the other patch, which has a lower probability of switching between
     * colors.
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number; // In milliseconds
    showFeedbackAfterEachTrial: boolean;
    private durationOfFeedback: number;
    private delayToShowHelpMessage: number;
    private durationHelpMessageShown: number;
    private probOfShiftFirstPatch: number;
    private probOfShiftSecondPatch: number;
    private numTrials: number;
    private skippable: boolean;
    private oddEvenColor: Color;
    private ltGtColor: Color;
    private counterbalanceMode: 'none' | 'counterbalance' | 'counterbalance-alternative';
    private setCounterBalancePatchStringInMemory: 'none' | 'counterbalance' | 'counterbalance-alternative';
    thresholdForRepeat: number = 0.8; // currently hardcoded, can change this if required in the future

    // high level variables
    counterbalance: DemandSelectionCounterbalance;
    taskData: DemandSelectionTaskData[];
    stimuli: DemandSelectionStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    blockNum: number = 0;
    showPatches: boolean = false;
    showDigit: boolean = false;
    digit: number = 0;
    feedback: string = '';
    color: string = '';
    trialNum: number = 0;
    showFixation: boolean = false;
    showFeedback: boolean = false;
    responseAllowed: boolean = false;
    showStimulus: boolean = false;
    selectedPatch: 'firstPatch' | 'secondPatch';

    // translation mapping
    translationMapping = {
        'HARDER PATCH': {
            en: 'HARDER PATCH',
            fr: 'LA PARCELLE PLUS DIFFICILE',
        },
        'EASIER PATCH': {
            en: 'EASIER PATCH',
            fr: 'LA PARCELLE PLUS FACILE',
        },
        bullseyeHelpMessage: {
            en: 'Please move your cursor to the bullseye for the patches to appear',
            fr: 'Déplacez votre curseur vers le centre de la cible pour faire apparaître les parcelles',
        },
        choosePatchHelpMessage: {
            en: 'Please choose a patch by moving your cursor to its location',
            fr: 'Veuillez choisir une parcelle en déplaçant votre curseur à son emplacement',
        },
    };

    // timers
    maxResponseTimer: any;
    showHelpMessageTimer: any;

    public readonly imagePath = '/assets/images/stimuli/demandselection/';

    get currentStimulus(): DemandSelectionStimulus {
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

    configure(metadata: DemandSelectionMetadata, config: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.numTrials = throwErrIfNotDefined(metadata.componentConfig.numTrials, 'num trials not defined');
            this.maxResponseTime = throwErrIfNotDefined(
                metadata.componentConfig.maxResponseTime,
                'max response time not defined'
            );
            this.probOfShiftFirstPatch = throwErrIfNotDefined(
                metadata.componentConfig.probOfShiftFirstPatch,
                'first patch shift probability not defined'
            );
            this.probOfShiftSecondPatch = throwErrIfNotDefined(
                metadata.componentConfig.probOfShiftSecondPatch,
                'second patch shift probability not defined'
            );
            this.counterbalanceMode = throwErrIfNotDefined(
                metadata.componentConfig.counterbalanceMode,
                'counterbalanceMode not defined'
            );
        } catch (error) {
            throw new Error('values not defined, cannot start study: ' + error);
        }

        this.config = config;
        this.isPractice = thisOrDefault(metadata.componentConfig.isPractice, false);
        this.interTrialDelay = thisOrDefault(metadata.componentConfig.interTrialDelay, 0);
        this.setCounterBalancePatchStringInMemory = thisOrDefault(
            metadata.componentConfig.setCounterBalancePatchStringInMemory,
            'none'
        );
        this.showFeedbackAfterEachTrial = thisOrDefault(metadata.componentConfig.showFeedbackAfterEachTrial, false);
        this.durationHelpMessageShown = thisOrDefault(metadata.componentConfig.durationHelpMessageShown, 6000);
        this.durationOfFeedback = thisOrDefault(metadata.componentConfig.durationOfFeedback, 0);
        this.skippable = thisOrDefault(metadata.componentConfig.skippable, false);
        this.delayToShowHelpMessage = thisOrDefault(metadata.componentConfig.delayToShowHelpMessage, 4000);
        this.oddEvenColor = thisOrDefault(metadata.componentConfig.oddEvenColor, Color.BLUE);
        this.ltGtColor = thisOrDefault(metadata.componentConfig.ltGtColor, Color.ORANGE);

        this.counterbalance = config.counterBalanceGroups[config.counterbalanceNumber] as DemandSelectionCounterbalance;

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    async start() {
        // even though this is done at each block, we are caching these values to be
        // used by the display component when counterbalance is required

        this.taskData = [];
        this.currentStimuliIndex = 0;
        this.blockNum = this.config.getCacheValue(DemandSelectionCache.BLOCK_NUM) || 1; // set to 1 if not defined

        // store the correct string in memory to be presented to the user
        switch (this.setCounterBalancePatchStringInMemory) {
            case 'counterbalance':
                const counterbalancePatchStringInMemory =
                    this.translationMapping[this.counterbalance][this.translateService.currentLang];
                this.config.setCacheValue(
                    DemandSelectionCache.PATCH_STRING_PRESENTED,
                    counterbalancePatchStringInMemory
                );
                break;
            case 'counterbalance-alternative':
                const counterbalanceAlternative =
                    this.counterbalance === DemandSelectionCounterbalance.SELECTEASYPATCH
                        ? DemandSelectionCounterbalance.SELECTHARDPATCH
                        : DemandSelectionCounterbalance.SELECTEASYPATCH;

                const counterbalanceAltPatchStringInMemory =
                    this.translationMapping[counterbalanceAlternative][this.translateService.currentLang];
                this.config.setCacheValue(
                    DemandSelectionCache.PATCH_STRING_PRESENTED,
                    counterbalanceAltPatchStringInMemory
                );
                break;
            case 'none':
            default:
                this.config.setCacheValue(DemandSelectionCache.PATCH_STRING_PRESENTED, '');
                break;
        }

        if (!this.stimuli) {
            // grab the previously used stimuli in order to make sure we don't repeat
            const cachedUsedImgStims = (this.config.getCacheValue(DemandSelectionCache.USED_STIMS_ARRAY) ||
                []) as string[];
            switch (this.counterbalanceMode) {
                case 'none':
                    this.counterbalance = DemandSelectionCounterbalance.NONE;
                    break;
                case 'counterbalance':
                    // already set
                    break;
                case 'counterbalance-alternative':
                    // if counterbalance-alternative, then flip the two
                    this.counterbalance =
                        this.counterbalance === DemandSelectionCounterbalance.SELECTEASYPATCH
                            ? DemandSelectionCounterbalance.SELECTHARDPATCH
                            : DemandSelectionCounterbalance.SELECTEASYPATCH;
                    break;
            }
            this.stimuli = this.dataGenService.generateDemandSelectionStimuli(
                this.numTrials,
                this.probOfShiftFirstPatch,
                this.probOfShiftSecondPatch,
                this.oddEvenColor,
                this.ltGtColor,
                cachedUsedImgStims,
                this.counterbalance
            );
            this.config.setCacheValue(DemandSelectionCache.USED_STIMS_ARRAY, cachedUsedImgStims);
        }
        super.start();
    }

    // 1. present bullseye to participant
    beginRound() {
        this.timerService.clearTimer();
        this.showDigit = false;
        this.showPatches = false;
        this.showFeedback = false;
        this.showStimulus = true;
        this.showFixation = true;

        this.setHelpMessageTimer(
            this.delayToShowHelpMessage,
            this.durationHelpMessageShown,
            this.translationMapping.bullseyeHelpMessage[this.translateService.currentLang]
        );
    }

    // 2. mouse hovers over the bullseye so we hide it and show the patches
    onHoverFixation(_event) {
        this.clearHelpMessage();
        this.timerService.startTimer();
        this.showFixation = false;
        this.showPatches = true;
        this.showDigit = false;
        this.responseAllowed = false;
        this.setHelpMessageTimer(
            this.delayToShowHelpMessage,
            this.durationHelpMessageShown,
            this.translationMapping.choosePatchHelpMessage[this.translateService.currentLang]
        );
    }

    // 3. mouse hovers over a patch so we show the numbers and accept responses
    onHoverPatch(_event, patch: 'firstPatch' | 'secondPatch') {
        this.clearHelpMessage();
        this.showDigit = true;
        let actualAnswer: UserResponse;

        this.color = this.currentStimulus[patch];
        this.selectedPatch = patch;
        this.digit = this.currentStimulus.digit;

        if (this.color === this.oddEvenColor) {
            actualAnswer = this.digit % 2 === 0 ? UserResponse.EVEN : UserResponse.ODD;
        } else {
            actualAnswer = this.digit > 5 ? UserResponse.GREATER : UserResponse.LESSER;
        }

        this.taskData.push({
            trial: ++this.trialNum,
            userID: this.userID,
            harderPatch: this.currentStimulus.secondPatchImgName,
            firstPatch: this.currentStimulus.firstPatchImgName,
            secondPatch: this.currentStimulus.secondPatchImgName,
            selectedPatch:
                patch === 'firstPatch'
                    ? this.currentStimulus.firstPatchImgName
                    : this.currentStimulus.secondPatchImgName,
            color: this.color,
            digit: this.digit,
            actualAnswer: actualAnswer,
            userAnswer: UserResponse.NA,
            selectPatchResponseTime: this.timerService.stopTimerAndGetTime(),
            respondToNumberResponseTime: 0,
            block: this.blockNum,
            isCorrect: false,
            taskGoal: this.counterbalance,
            score: 0,
            rotation: this.currentStimulus.rotation,
            isPractice: this.isPractice,
            submitted: this.timerService.getCurrentTimestamp(),
            studyId: this.studyId,
        });

        this.showFixation = false;
        this.showDigit = true;
        this.responseAllowed = true;

        this.timerService.clearTimer();
        this.timerService.startTimer();

        // Give participant max time to respond to stimuli
        this.setMaxResponseTimer(this.maxResponseTime, () => {
            this.responseAllowed = false;
            if (this.isDestroyed) return;
            this.handleRoundInteraction(null);
        });
    }

    private clearHelpMessage() {
        this.snackbarService.clearSnackbar();
        clearTimeout(this.showHelpMessageTimer);
    }

    private clearMaxResponseTimer() {
        clearTimeout(this.maxResponseTimer);
    }

    private setHelpMessageTimer(delay: number, duration: number, message: string, cbFunc?: () => void) {
        this.showHelpMessageTimer = setTimeout(() => {
            if (this.isDestroyed) return;
            this.snackbarService.openInfoSnackbar(message, '', duration);
            if (cbFunc) cbFunc();
        }, delay);
    }

    private setMaxResponseTimer(delay: number, cbFunc?: () => void) {
        this.maxResponseTimer = window.setTimeout(() => {
            if (cbFunc) cbFunc();
        }, delay);
    }

    private isValidKey(key: string): boolean {
        return key === Key.ARROWLEFT || key === Key.ARROWRIGHT;
    }

    @HostListener('window:keydown', ['$event'])
    handleRoundInteraction(event: KeyboardEvent) {
        if (this.taskData?.length > 0) {
            // guard against case where we have not selected our first patch
            const thisTrial = this.taskData[this.taskData.length - 1];
            thisTrial.submitted = this.timerService.getCurrentTimestamp();

            if (event === null) {
                this.clearHelpMessage();
                this.clearMaxResponseTimer();
                thisTrial.userAnswer = UserResponse.NA;
                thisTrial.score = 0;
                thisTrial.isCorrect = false;
                thisTrial.respondToNumberResponseTime = this.maxResponseTime;
                super.handleRoundInteraction(null);
            } else if (this.responseAllowed && this.isValidKey(event.key)) {
                this.clearHelpMessage();
                this.clearMaxResponseTimer();
                thisTrial.respondToNumberResponseTime = this.timerService.stopTimerAndGetTime();
                const selectedColor = this.currentStimulus[this.selectedPatch];
                if (selectedColor === this.oddEvenColor) {
                    thisTrial.userAnswer = event.key === Key.ARROWLEFT ? UserResponse.ODD : UserResponse.EVEN;
                } else {
                    thisTrial.userAnswer = event.key === Key.ARROWLEFT ? UserResponse.LESSER : UserResponse.GREATER;
                }
                super.handleRoundInteraction(event.key);
            }
        }
    }

    async completeRound() {
        this.showStimulus = false;
        this.showPatches = false;
        this.showFixation = false;
        this.showDigit = false;
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
            const numCorrect = this.taskData.reduce((acc, currVal) => {
                return acc + (currVal.isCorrect ? 1 : 0);
            }, 0);

            this.config.setCacheValue(
                DemandSelectionCache.BLOCK_NUM,
                this.isPractice ? this.blockNum : ++this.blockNum
            );

            const shouldSkip = numCorrect / this.numTrials >= this.thresholdForRepeat;
            this.config.setCacheValue(DemandSelectionCache.SHOULD_SKIP, shouldSkip);

            this.config.setCacheValue(DemandSelectionCache.NUM_CORRECT, numCorrect);
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

    afterInit() {
        if (this.skippable) {
            const shouldSkip = this.config.getCacheValue(DemandSelectionCache.SHOULD_SKIP) as boolean;
            if (shouldSkip === undefined) return;
            // no cached value, do not skip
            else if (shouldSkip) {
                // loader is shown on component init (from the base task constructor)
                // and is supposed to show for 2 seconds. We need to manually cancel that
                // as the component is marked as destroyed (and timeout is cancelled)
                this.loaderService.hideLoader();
                this.handleComplete();
            }
        }
    }
}
