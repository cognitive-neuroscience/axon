import { Component, OnDestroy } from '@angular/core';
import { NzMarks } from 'ng-zorro-antd/slider';
import { throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { StimuliProvidedType } from 'src/app/models/enums';
import { EverydayChoiceTaskData } from 'src/app/models/TaskData';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { ChoiceTaskStimulus } from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../../base-task';
import { TaskPlayerState } from '../../task-player/task-player.component';
import { RaterCache, RatingTaskCounterBalance } from '../rater/rater.component';

export interface ChoiceTaskMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        delayToShowHelpMessage: number;
        durationHelpMessageShown: number;
        delayToShowRatingInput: number;
        durationOutOftimeMessageShown: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: ChoiceTaskStimulus[];
        };
    };
}

@Component({
    selector: 'app-choicer',
    templateUrl: './choicer.component.html',
    styleUrls: ['./choicer.component.scss', '../rater/rater.component.scss'],
})
export class ChoicerComponent extends AbstractBaseTaskComponent implements OnDestroy {
    /**
     * Task summary:
     * You have the same n activities from the rating task. We create n pairs where each activity appears exactly
     * twice in separate pairs. A slider is shown, and the participant selects a value which indicates whether they
     * prefer the left option or the right option.
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number; // In milliseconds
    private delayToShowHelpMessage: number; //delay to show help message
    private delayToShowRatingInput: number;
    private durationHelpMessageShown: number;
    private durationOutOftimeMessageShown: number;

    // shared state variables
    ratingTaskActivities: string[];

    // high level variables
    taskData: EverydayChoiceTaskData[];
    stimuli: ChoiceTaskStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    showStimulus: boolean = false;
    showNextButton: boolean = false;
    showInput: boolean = false;
    trialNum: number = 0;

    activitiesShown: { label: string; value: string }[] = [];

    maxResponseTimer: any;
    showHelpMessageTimer: any;

    get currentStimulus(): ChoiceTaskStimulus {
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

    configure(metadata: ChoiceTaskMetadata, config: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }

        this.ratingTaskActivities = config.getCacheValue(RaterCache.NEW_ACTIVITIES);
        this.isPractice = metadata.componentConfig.isPractice || false;
        this.interTrialDelay = metadata.componentConfig.interTrialDelay || 0;
        this.maxResponseTime = metadata.componentConfig.maxResponseTime || undefined;
        this.durationOutOftimeMessageShown = metadata.componentConfig.durationOutOftimeMessageShown || undefined;
        this.delayToShowHelpMessage = metadata.componentConfig.delayToShowHelpMessage || undefined;
        this.durationHelpMessageShown = metadata.componentConfig.durationHelpMessageShown || undefined;
        this.delayToShowRatingInput = metadata.componentConfig.delayToShowRatingInput || 0;

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    start() {
        this.taskData = [];
        // either the stimuli has been defined in config or we generate it here
        if (!this.stimuli) this.stimuli = this.dataGenService.generateChoiceStimuli(this.ratingTaskActivities);
        this.currentStimuliIndex = 0;
        super.start();
    }

    async beginRound() {
        this.showNextButton = false;
        this.showInput = false;
        this.timerService.clearTimer();

        this.taskData.push({
            taskName: 'Choice Game',
            trial: ++this.trialNum,
            userID: this.userID,
            counterbalance: RatingTaskCounterBalance.NA,
            userAnswer: null,
            question: '',
            activity: `${this.currentStimulus.firstActivity} VS ${this.currentStimulus.secondActivity}`,
            activityType: '',
            responseTime: null,
            submitted: this.timerService.getCurrentTimestamp(),
            isPractice: this.isPractice,
            studyId: this.studyId,
        });

        this.setStimuliUI(this.currentStimulus);
        this.showStimulus = true;

        await wait(this.delayToShowRatingInput);
        if (this.isDestroyed) return;

        this.timerService.startTimer();
        this.showInput = true;

        // if these values are not set in the config, then we assume that they are not wanted
        if (this.maxResponseTime !== undefined) {
            this.setTimer(
                'maxResponseTimer',
                'Please do your best to provide your answer in the time allotted for the next trial',
                this.maxResponseTime,
                this.durationOutOftimeMessageShown,
                async () => {
                    this.showStimulus = false; // callback function called after timeout completes
                    await wait(this.durationOutOftimeMessageShown);
                    if (this.isDestroyed) return;
                    this.handleRoundInteraction(null);
                }
            );
        }
        if (this.delayToShowHelpMessage !== undefined) {
            this.setTimer(
                'helpMessageTimer',
                'Please make the rating by clicking the button corresponding to the activity you would like to select',
                this.delayToShowHelpMessage,
                this.durationHelpMessageShown
            );
        }
    }

    private setStimuliUI(stimulus: ChoiceTaskStimulus) {
        this.activitiesShown = [
            {
                label: stimulus.firstActivity,
                value: stimulus.firstActivity,
            },
            {
                label: stimulus.secondActivity,
                value: stimulus.secondActivity,
            },
        ];
    }

    /**
     * We want to update the trial with the response time and slider value.
     * Only when we receive null as an arg (meaning that the timeout has completed)
     * that we move on. Otherwise, we just keep replacing the trial with updated data
     */
    handleRoundInteraction(inputValue: string) {
        const thisTrial = this.taskData[this.taskData.length - 1];
        if (inputValue === null) {
            // no input, ran out of time
            thisTrial.responseTime = this.maxResponseTime;
            thisTrial.userAnswer = ''; // set anchor to default middle
            super.handleRoundInteraction(inputValue);
            return;
        } else {
            thisTrial.responseTime = this.timerService.getTime();
            thisTrial.submitted = this.timerService.getCurrentTimestamp();
            thisTrial.userAnswer = inputValue;
            this.showNextButton = true;
            super.handleRoundInteraction(inputValue);
            return;
        }
    }

    completeRound() {
        this.showStimulus = false;
        this.cancelAllTimers();
        super.completeRound();
    }

    async decideToRepeat() {
        // we have reached past the final activity
        const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1;
        if (finishedLastStimulus) {
            // signal to parent component we are done and send over task data
            super.decideToRepeat();
            return;
        }
        this.currentStimuliIndex++;
        await wait(this.interTrialDelay);
        if (this.isDestroyed) return;
        this.beginRound();
        return;
    }

    private setTimer(
        timerType: 'helpMessageTimer' | 'maxResponseTimer',
        message: string,
        delay: number,
        duration: number,
        cbFunc?: () => void
    ) {
        if (timerType === 'helpMessageTimer') {
            this.showHelpMessageTimer = setTimeout(() => {
                this.snackbarService.openErrorSnackbar(message, '', duration);
                if (cbFunc) cbFunc();
            }, delay);
        } else if (timerType === 'maxResponseTimer') {
            this.maxResponseTimer = setTimeout(() => {
                this.snackbarService.openErrorSnackbar(message, '', duration);
                if (cbFunc) cbFunc();
            }, delay);
        } else {
            throw new Error('Invalid Timer type, could not set timer');
        }
    }

    private cancelAllTimers() {
        this.snackbarService.clearSnackbar();
        clearTimeout(this.maxResponseTimer);
        clearTimeout(this.showHelpMessageTimer);
    }

    ngOnDestroy() {
        this.isDestroyed = true;
        this.cancelAllTimers();
        this.loaderService.hideLoader();
    }
}
