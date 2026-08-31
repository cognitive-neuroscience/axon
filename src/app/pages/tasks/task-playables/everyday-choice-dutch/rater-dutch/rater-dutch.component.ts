import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzMarks } from 'ng-zorro-antd/slider';
import { getTextForLang, throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { StimuliProvidedType, SupportedLangs } from 'src/app/models/enums';
import { ITranslationText, UserResponse } from 'src/app/models/InternalDTOs';
import { EverydayChoiceDutchTaskData } from 'src/app/models/ParticipantData';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { RatingTaskStimuliDutch } from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../../base-task';
import { TaskPlayerState } from '../../task-player/task-player.component';

export enum RatingTaskCounterBalanceDutch {
    LOWTOHIGHENDORSEMENT = 'LOWTOHIGH',
    HIGHTOLOWENDORSEMENT = 'HIGHTOLOW',
    NA = 'NA',
}

export interface RaterTaskMetadata {
    componentName: ComponentName;
    componentConfig: {
        numTrials: number;
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        delayToShowHelpMessage: number;
        durationHelpMessageShown: number;
        counterbalance: RatingTaskCounterBalanceDutch;
        delayToShowRatingSlider: number;
        durationOutOftimeMessageShown: number;
        interActivityDelay: number;
        // Social activities
        numHHHActivities: number;
        numHHLActivities: number;
        numHLHActivities: number;
        numHLLActivities: number;
        // Non social activities
        numLHHActivities: number;
        numLHLActivities: number;
        numLLHActivities: number;
        numLLLActivities: number;
        // Ambiguous activities
        numAMBActivities: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: RatingTaskStimuliDutch[];
        };
    };
}

export enum RaterCacheDutch {
    ALL_ACTIVITIES = 'rater-dutch-all-activities',
    ACTIVITIES_FOR_CHOICER = 'rater-dutch-activities-for-choicer',
    STIMULI = 'rater-dutch-stimuli',
}

@Component({
    selector: 'app-rater-dutch',
    templateUrl: './rater-dutch.component.html',
    styleUrls: ['./rater-dutch.component.scss'],
})
export class RaterDutchComponent extends AbstractBaseTaskComponent implements OnDestroy {
    /**
     * Task summary:
     * You have multiple activities, choosing some from "DoSomething" and some from "DoNothing".
     * For every activity, we ask the same questions in random order. The participant responds to
     * these questions using a slider indicating an extreme based on given labels.
     */

    // config variables variables
    isPractice: boolean = false;
    private numTrials: number;
    private maxResponseTime: number;
    private interTrialDelay: number; // In milliseconds
    private interActivityDelay: number; // In milliseconds
    private delayToShowHelpMessage: number; //delay to show help message
    private delayToShowRatingSlider: number;
    private durationHelpMessageShown: number;
    private durationOutOftimeMessageShown: number;
    counterbalance: RatingTaskCounterBalanceDutch;

    // social activities
    private numHHHActivities: number;
    private numHHLActivities: number;
    private numHLHActivities: number;
    private numHLLActivities: number;
    // non social activities
    private numLHHActivities: number;
    private numLHLActivities: number;
    private numLLHActivities: number;
    private numLLLActivities: number;
    // ambiguous activities
    private numAMBActivities: number;

    // high level variables
    taskData: EverydayChoiceDutchTaskData[];
    stimuli: RatingTaskStimuliDutch[];
    currentStimuliIndex: number; // index of the stimuli we are on
    currentQuestionIndex: number; // index of the question we are on within the stimulus
    shouldReverse: boolean = false; // based on counterbalance - reverses order of endorsement

    // local state variables
    showStimulus: boolean = false;
    showNextButton: boolean = false;
    showSlider: boolean = false;
    trialNum: number = 0;

    currentSliderMarks: NzMarks = {}; // set slider legend

    activityShown: ITranslationText = null;
    questionShown: ITranslationText = null;

    maxResponseTimer: any;
    showHelpMessageTimer: any;

    // translation mapping
    translationMapping = {
        helpMessage: {
            en: 'Please make the rating by adjusting the slider and clicking next',
            nl: 'Geef uw beoordeling door de schuifregelaar aan te passen en op Volgende te klikken.',
        },
        maxResponseMessage: {
            en: 'Please do your best to provide your answer in the time allotted for the next trial.',
            nl: 'Probeer uw antwoord binnen de beschikbare tijd voor de volgende ronde te geven.',
        },
        practiceHelpMessage: {
            en: 'Please use your mouse to drag the cursor to the spot on the scale that corresponds to your answer.',
            nl: 'Gebruik uw muis om de schuifregelaar naar de positie op de schaal te slepen die overeenkomt met uw antwoord.',
        },
    };

    get currentStimulus(): RatingTaskStimuliDutch {
        return this.stimuli[this.currentStimuliIndex];
    }

    get currentQuestion(): RatingTaskStimuliDutch['questions'][number] | undefined {
        return this.currentStimulus?.questions[this.currentQuestionIndex];
    }

    get isCurrentQuestionMultiPart(): boolean {
        return !!this.currentQuestion?.isMultiPartQuestion;
    }

    binaryChoiceOptions: { label: string; value: string }[] = [];

    configure(metadata: RaterTaskMetadata, config: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }

        this.config = config;
        this.numTrials = metadata.componentConfig.numTrials || 13;
        this.isPractice = metadata.componentConfig.isPractice || false;
        this.maxResponseTime = metadata.componentConfig.maxResponseTime || undefined;
        this.interTrialDelay = metadata.componentConfig.interTrialDelay || 0;
        this.interActivityDelay = metadata.componentConfig.interActivityDelay || 0;
        this.delayToShowHelpMessage = metadata.componentConfig.delayToShowHelpMessage || undefined;
        this.durationHelpMessageShown = metadata.componentConfig.durationHelpMessageShown || undefined;
        this.delayToShowRatingSlider = metadata.componentConfig.delayToShowRatingSlider || 0;
        this.durationOutOftimeMessageShown = metadata.componentConfig.durationOutOftimeMessageShown || undefined;

        this.numHHHActivities = metadata.componentConfig.numHHHActivities || 0;
        this.numHHLActivities = metadata.componentConfig.numHHLActivities || 0;
        this.numHLHActivities = metadata.componentConfig.numHLHActivities || 0;
        this.numHLLActivities = metadata.componentConfig.numHLLActivities || 0;
        this.numLHHActivities = metadata.componentConfig.numLHHActivities || 0;
        this.numLHLActivities = metadata.componentConfig.numLHLActivities || 0;
        this.numLLHActivities = metadata.componentConfig.numLLHActivities || 0;
        this.numLLLActivities = metadata.componentConfig.numLLLActivities || 0;
        this.numAMBActivities = metadata.componentConfig.numAMBActivities || 0;
        this.counterbalance = config.counterBalanceGroups[config.counterbalanceNumber] as RatingTaskCounterBalanceDutch;

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED) {
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
        } else {
            // we only generate the activity data once and store it in the cache so we can reuse it later.
            const allActivities = this.config.getCacheValue(RaterCacheDutch.ALL_ACTIVITIES) as ITranslationText[];
            if (!allActivities) {
                this.config.setCacheValue(
                    RaterCacheDutch.ALL_ACTIVITIES,
                    this.dataGenService.generateRatingActivitiesDutch(
                        this.numHHHActivities,
                        this.numHHLActivities,
                        this.numHLHActivities,
                        this.numHLLActivities,
                        this.numLHHActivities,
                        this.numLHLActivities,
                        this.numLLHActivities,
                        this.numLLLActivities,
                        this.numAMBActivities
                    )
                );

                this.config.setCacheValue(RaterCacheDutch.ACTIVITIES_FOR_CHOICER, allActivities);
            }
        }
    }

    constructor(
        protected snackbarService: SnackbarService,
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService,
        private translateService: TranslateService
    ) {
        super(loaderService);
    }

    get practiceHelpMessage(): string {
        return this.translationMapping.practiceHelpMessage[this.translateService.currentLang];
    }

    start() {
        this.taskData = [];

        // either the stimuli has been defined in config or we generate it here
        if (!this.stimuli) {
            this.config.setCacheValue(
                RaterCacheDutch.STIMULI,
                this.dataGenService.generateRatingStimuliDutch(
                    this.config.getCacheValue(RaterCacheDutch.ALL_ACTIVITIES) as ITranslationText[]
                )
            );
            const raterActivities = this.config.getCacheValue(RaterCacheDutch.STIMULI) as RatingTaskStimuliDutch[];
            this.stimuli = raterActivities.slice(0, this.numTrials);
            this.config.setCacheValue(
                RaterCacheDutch.STIMULI,
                raterActivities.slice(this.numTrials, raterActivities.length)
            );
        }
        this.currentStimuliIndex = 0;
        this.currentQuestionIndex = 0;
        this.shouldReverse = this.counterbalance === RatingTaskCounterBalanceDutch.HIGHTOLOWENDORSEMENT;
        super.start();
    }

    async beginRound() {
        this.showNextButton = false;
        this.showSlider = false;
        this.timerService.clearTimer();

        const currentQuestion = this.currentQuestion;
        // Follow-up questions keep isMultiPartQuestion: false in stimuli so they are not
        // treated as another gate. Still record them as multi-part in taskData when the
        // previous trial was a Yes on this activity's gate question.
        const isMultiPartInTaskData = !!currentQuestion?.isMultiPartQuestion || this.isCurrentQuestionFollowUp();

        this.taskData.push({
            taskName: 'Rating Game',
            trial: ++this.trialNum,
            userID: this.userID,
            counterbalance: this.counterbalance,
            userAnswer: null,
            question: currentQuestion!.question.en,
            isMultiPartQuestion: isMultiPartInTaskData,
            activity: this.currentStimulus.activity.en,
            activityType: this.currentStimulus.type,
            responseTime: null,
            submitted: this.timerService.getCurrentTimestamp(),
            isPractice: this.isPractice,
            studyId: this.studyId,
        });

        this.setStimuliUI(this.currentStimulus);
        this.showStimulus = true;

        await wait(this.delayToShowRatingSlider);
        if (this.isDestroyed) return;

        this.timerService.startTimer();
        this.showSlider = true;

        // if these values are not set in the config, then we assume that they are not wanted
        if (this.maxResponseTime !== undefined) {
            this.setTimer(
                'maxResponseTimer',
                this.translationMapping.maxResponseMessage[this.translateService.currentLang as SupportedLangs],
                this.maxResponseTime,
                this.durationOutOftimeMessageShown,
                async () => {
                    this.showStimulus = false; // callback function called after timeout completes
                    await wait(this.durationOutOftimeMessageShown); // show help message for the correct amount of time. Otherwise this snackbar will be cleared
                    if (this.isDestroyed) return;
                    this.handleRoundInteraction(null);
                }
            );
        }
        if (this.delayToShowHelpMessage !== undefined && !this.isCurrentQuestionMultiPart) {
            this.setTimer(
                'helpMessageTimer',
                this.translationMapping.helpMessage[this.translateService.currentLang as SupportedLangs],
                this.delayToShowHelpMessage,
                this.durationHelpMessageShown
            );
        }
    }

    private setStimuliUI(stimulus: RatingTaskStimuliDutch) {
        const stimulusQuestion = stimulus.questions[this.currentQuestionIndex];

        this.activityShown = stimulus.activity;
        this.questionShown = stimulusQuestion.question;
        this.binaryChoiceOptions = (stimulusQuestion.legend ?? []).map((item) => ({
            label: item[this.translateService.currentLang as SupportedLangs] || item.en,
            value: item.en,
        }));

        if (stimulusQuestion.isMultiPartQuestion) {
            return;
        }

        const tempMarks: NzMarks = {};
        let index = 0;
        const tickIncrement = 100 / (stimulusQuestion.legend.length - 1);

        for (let i = 0; i < stimulusQuestion.legend.length; i++) {
            tempMarks[index] = stimulusQuestion.legend[i][this.translateService.currentLang];
            index += tickIncrement;
        }

        this.currentSliderMarks = tempMarks;
    }

    /**
     * We want to update the trial with the response time and slider value.
     * Only when we receive null as an arg (meaning that the timeout has completed)
     * that we move on. Otherwise, we just keep replacing the trial with updated data
     */
    handleRoundInteraction(inputValue: number | string | null) {
        const thisTrial = this.taskData[this.taskData.length - 1];
        if (inputValue === null) {
            // no input, ran out of time
            thisTrial.responseTime = this.maxResponseTime;
            thisTrial.userAnswer = this.isCurrentQuestionMultiPart ? UserResponse.NA : `${50}`;
            super.handleRoundInteraction(inputValue);
            return;
        }

        // Yes/No can be clicked twice before the view updates; ignore extra clicks
        if (this.isCurrentQuestionMultiPart && thisTrial.userAnswer !== null) {
            return;
        }

        thisTrial.responseTime = this.timerService.getTime();
        thisTrial.submitted = this.timerService.getCurrentTimestamp();
        thisTrial.userAnswer = `${inputValue}`;
        if (this.isCurrentQuestionMultiPart) {
            super.handleRoundInteraction(inputValue);
            return;
        }
        this.showNextButton = true;
        return;
    }

    completeRound() {
        this.showStimulus = false;
        this.cancelAllTimers();
        super.completeRound();
    }

    async decideToRepeat() {
        this.insertFollowUpQuestionIfNeeded();

        // we have reached past the final question for the activity
        const finishedLastQuestion = this.currentQuestionIndex >= this.currentStimulus.questions.length - 1;
        if (finishedLastQuestion) {
            this.currentQuestionIndex = 0;

            // we have reached past the final activity
            const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1;
            if (finishedLastStimulus) {
                // signal to parent component we are done and send over task data
                super.decideToRepeat();
                return;
            }
            this.currentStimuliIndex++;
            this.loaderService.showLoader();
            await wait(this.interActivityDelay);
            this.loaderService.hideLoader();
        } else {
            this.currentQuestionIndex++;
            await wait(this.interTrialDelay);
        }
        if (this.isDestroyed) return;
        this.beginRound();
        return;
    }

    /**
     * If the current question is a Yes/No gate and the participant selected Yes,
     * insert the follow-up as the next question on this activity. The inserted
     * question has isMultiPartQuestion: false so it is shown as a normal slider
     * and does not trigger another insertion.
     */
    private insertFollowUpQuestionIfNeeded() {
        const currentQuestion = this.currentQuestion;
        if (
            !currentQuestion?.isMultiPartQuestion ||
            !currentQuestion.followUpQuestion ||
            !currentQuestion.followUpLegend
        ) {
            return;
        }

        const thisTrial = this.taskData[this.taskData.length - 1];
        const yesAnswer = currentQuestion.legend[currentQuestion.legend.length - 1].en;
        if (thisTrial?.userAnswer !== yesAnswer) {
            return;
        }

        this.currentStimulus.questions.splice(this.currentQuestionIndex + 1, 0, {
            question: currentQuestion.followUpQuestion,
            legend: currentQuestion.followUpLegend,
            isMultiPartQuestion: false,
        });
    }

    // True when this round is the follow-up inserted after a Yes on the previous gate.
    private isCurrentQuestionFollowUp(): boolean {
        const previousQuestion = this.currentStimulus?.questions[this.currentQuestionIndex - 1];
        const previousTrial = this.taskData[this.taskData.length - 1];
        if (!previousQuestion?.isMultiPartQuestion || !previousTrial) {
            return false;
        }
        const yesAnswer = previousQuestion.legend[previousQuestion.legend.length - 1].en;
        return previousTrial.userAnswer === yesAnswer;
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

    getTranslation(text: ITranslationText): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, text);
    }

    private cancelAllTimers() {
        this.snackbarService.clearSnackbar();
        clearTimeout(this.maxResponseTimer);
        clearTimeout(this.showHelpMessageTimer);
    }

    ngOnDestroy() {
        this.cancelAllTimers();
        this.loaderService.hideLoader();
    }
}
