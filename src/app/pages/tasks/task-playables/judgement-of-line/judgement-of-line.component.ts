import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { throwErrIfNotDefined, wait } from 'src/app/common/commonMethods';
import { StimuliProvidedType, SupportedLangs } from 'src/app/models/enums';
import { UserResponse } from 'src/app/models/InternalDTOs';
import { JudgementOfLineTaskData } from 'src/app/models/ParticipantData';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../base-task';
import { TaskPlayerState } from '../task-player/task-player.component';

interface JudgementOfLineMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        durationOfFeedback: number;
        numTrials: number;
        interTrialDelay: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: string[];
        };
    };
}

@Component({
    selector: 'app-judgement-of-line',
    templateUrl: './judgement-of-line.component.html',
    styleUrls: ['./judgement-of-line.component.scss'],
})
export class JudgementOfLineComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary: You will see a line at the top of the screen, and a bunch of lines at the bottom radiating from a single point.
     * You need to select the line at the bottom that is closest to the line at the top in terms of alignment.
     */

    // config variables
    isPractice: boolean = true;
    private numTrials = 0;
    private maxResponseTime = 10000;
    private interTrialDelay = 0;
    private durationOfFeedback = 0;

    // high level variables
    taskData: JudgementOfLineTaskData[];
    stimuli: string[]; // [ "15", "1", "8", ... ]
    currentStimuliIndex: number = 0;

    // local state variables
    trialNum = 0;
    stimulusShown = '';
    allowResponse = false;
    showFeedback = false;
    showStimulus = false;
    showNext = false;
    showTimeRemaining = false;
    feedback: string = '';
    timeRemaining: number;
    readonly lines = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
    private timer: any;
    private interval: any;

    translationMapping = {
        [SupportedLangs.EN]: {
            TOOSLOW: 'Please respond faster next time',
        },
        [SupportedLangs.FR]: {
            TOOSLOW: 'Veuillez répondre plus vite la prochaine fois',
        },
    };

    numToAngleMapping = {
        '1': '0',
        '2': '12.857',
        '3': '25.714',
        '4': '38.571',
        '5': '51.429',
        '6': '64.286',
        '7': '77.14',
        '8': '90',
        '9': '102.857',
        '10': '115.714',
        '11': '128.571',
        '12': '141.429',
        '13': '154.286',
        '14': '167.143',
        '15': '180',
    };

    get currentStimulus(): string {
        return this.stimuli[this.currentStimuliIndex];
    }

    get currentTrial(): JudgementOfLineTaskData {
        return this.taskData[this.taskData.length - 1];
    }

    constructor(
        protected timerService: TimerService,
        protected loaderService: LoaderService,
        protected dataGenService: DataGenerationService,
        protected translateService: TranslateService
    ) {
        super(loaderService);
    }

    configure(metadata: JudgementOfLineMetadata, config?: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.maxResponseTime = throwErrIfNotDefined(
                metadata.componentConfig.maxResponseTime,
                'max response time not defined'
            );

            this.config = config;
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }

        this.isPractice = metadata.componentConfig.isPractice;
        this.interTrialDelay = metadata.componentConfig.interTrialDelay || 0;
        this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
        this.currentStimuliIndex = 0;
        this.numTrials = metadata.componentConfig.numTrials;
        this.durationOfFeedback = metadata.componentConfig.durationOfFeedback || 1000;

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED) {
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
            this.numTrials = this.stimuli.length;
        }
    }

    private setStimulus() {
        this.showStimulus = true;
        this.allowResponse = true;
        this.stimulusShown = `angle-${this.currentStimulus}`;
    }
    private setTimer(delay: number, cbFunc?: () => void) {
        this.timer = window.setTimeout(() => {
            this.showTimeRemaining = false;
            clearTimeout(this.timer);
            if (cbFunc) cbFunc();
        }, delay);
        this.showTimeRemaining = true;
        this.timeRemaining = Math.round(delay / 1000);
        this.interval = window.setInterval(() => {
            if (this.timeRemaining === 0) {
                clearInterval(this.interval);
                return;
            }
            this.timeRemaining = this.timeRemaining - 1;
        }, 1000);
    }

    private cancelAllTimers() {
        clearTimeout(this.timer);
        clearInterval(this.interval);
    }

    async start() {
        this.taskData = [];
        this.currentStimuliIndex = 0;
        this.trialNum = 0;

        if (!this.stimuli) {
            this.dataGenService.generateJudgementOfLineStimuli(this.numTrials);
        }

        super.start();
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.showStimulus = false;
        this.allowResponse = false;

        this.setStimulus();

        this.taskData.push({
            userID: this.userID,
            studyId: this.studyId,
            isPractice: this.isPractice,
            trial: ++this.trialNum,
            isCorrect: false,
            responseTime: 0,
            userAnswer: '',
            targetLinePresented: this.currentStimulus,
            targetAnglePresented: this.numToAngleMapping[this.currentStimulus],
            submitted: this.timerService.getCurrentTimestamp(),
        });

        this.timerService.startTimer();

        this.setTimer(this.maxResponseTime, () => {
            this.showStimulus = false;
            this.handleRoundInteraction(null);
        });
    }

    handleRoundInteraction(lineSelected: string | null): void {
        if (!this.currentTrial.submitted) return;
        if (!this.allowResponse) return;

        if (lineSelected === null) {
            this.cancelAllTimers();
            this.currentTrial.userAnswer = UserResponse.NA;
            this.currentTrial.isCorrect = false;
            this.currentTrial.responseTime = this.maxResponseTime;
            super.handleRoundInteraction(null);
            return;
        }

        this.showTimeRemaining = false;
        this.currentTrial.submitted = this.timerService.getCurrentTimestamp();
        this.currentTrial.responseTime = this.timerService.stopTimerAndGetTime();
        this.cancelAllTimers();
        this.currentTrial.userAnswer = lineSelected;
        if (this.currentStimulus === '1' || this.currentStimulus === '15') {
            this.currentTrial.isCorrect = lineSelected === '1' || lineSelected === '15';
        } else {
            this.currentTrial.isCorrect = lineSelected === this.currentStimulus;
        }
        super.handleRoundInteraction(null);
    }

    async completeRound() {
        this.showStimulus = false;
        this.allowResponse = false;

        if (this.currentTrial.userAnswer === UserResponse.NA) {
            const noResponseFeedback = this.translationMapping[this.translateService.currentLang].TOOSLOW;
            this.feedback = noResponseFeedback;
            this.showFeedback = true;
            await wait(this.durationOfFeedback);
            if (this.isDestroyed) return;
            this.showFeedback = false;
        }

        super.completeRound();
    }

    onClickNextTrial() {
        this.showNext = false;
        this.cancelAllTimers();
        this.beginRound();
    }

    async decideToRepeat(): Promise<void> {
        const finishedLastStimulus = this.currentStimuliIndex >= this.stimuli.length - 1;
        if (finishedLastStimulus) {
            super.decideToRepeat();
        } else {
            this.currentStimuliIndex++;

            this.showNext = true;
            this.setTimer(this.interTrialDelay, () => {
                if (this.isDestroyed) return;
                this.showNext = false;
                this.cancelAllTimers();
                this.beginRound();
                return;
            });
        }
    }
}
