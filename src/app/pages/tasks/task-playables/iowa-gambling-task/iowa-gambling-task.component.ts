import { Component, HostListener } from '@angular/core';
import { throwErrIfNotDefined } from 'src/app/common/commonMethods';
import { StimuliProvidedType } from 'src/app/models/enums';
import { IowaGamblingTaskData } from 'src/app/models/ParticipantData';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { IowaGamblingTaskStimulus } from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../base-task';
import { TaskPlayerState } from '../task-player/task-player.component';

interface IowaGamblingMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        skippable: boolean;
        interTrialDelay: number;
        showFeedbackAfterEachTrial: boolean;
        showScoreAfterEachTrial: boolean;
        durationOfFeedback: number;
        durationFixationPresented: number;
        numTrials: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: {
                1: IowaGamblingTaskStimulus[];
                2: IowaGamblingTaskStimulus[];
                3: IowaGamblingTaskStimulus[];
                4: IowaGamblingTaskStimulus[];
            };
        };
    };
}

@Component({
    selector: 'app-iowa-gambling-task',
    templateUrl: './iowa-gambling-task.component.html',
    styleUrls: ['./iowa-gambling-task.component.scss'],
})
export class IowaGamblingTaskComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves the participant having an initial amount of money, and selecting one of 4 buttons the screen. Each button rewards/punishes the user
     * at varying degrees by either rewarding money, removing money, or both rewarding and removing money from the pot.
     */

    // config variables variables
    private numTrials: number;

    // high level variables
    taskData: IowaGamblingTaskData[];
    stimuli: {
        1: IowaGamblingTaskStimulus[];
        2: IowaGamblingTaskStimulus[];
        3: IowaGamblingTaskStimulus[];
        4: IowaGamblingTaskStimulus[];
    };

    // local state variables
    trialNum: number = 0;
    showFeedback: boolean;
    totalMoney: number;
    moneyWon: number;
    feePaid: number;
    buttonPressed: number | null = null;
    buttonResponseAllowed: boolean = false;
    spacebarResponseAllowed: boolean = false;
    button1Counter: number;
    button2Counter: number;
    button3Counter: number;
    button4Counter: number;

    get currentStimulus(): IowaGamblingTaskStimulus {
        switch (this.buttonPressed) {
            case 1:
                return this.stimuli[1][this.button1Counter % 60];
            case 2:
                return this.stimuli[2][this.button2Counter % 60];
            case 3:
                return this.stimuli[3][this.button3Counter % 60];
            case 4:
                return this.stimuli[4][this.button4Counter % 60];
            default:
                return;
        }
    }

    get currentTrial(): IowaGamblingTaskData {
        // will return null if taskData is not defined or if it has length of 0
        return this.taskData?.length > 0 ? this.taskData[this.taskData.length - 1] : null;
    }

    constructor(
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService
    ) {
        super(loaderService);
    }

    configure(metadata: IowaGamblingMetadata, config?: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.numTrials = throwErrIfNotDefined(metadata.componentConfig.numTrials, 'num trials not defined');
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }

        this.config = config;
        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    start() {
        this.buttonPressed = null;

        this.button1Counter = 0;
        this.button2Counter = 0;
        this.button3Counter = 0;
        this.button4Counter = 0;

        this.totalMoney = 2000;
        this.showFeedback = false;
        this.moneyWon = 0;
        this.feePaid = 0;

        this.taskData = [];

        this.buttonResponseAllowed = false;
        this.spacebarResponseAllowed = false;

        // either the stimuli has been defined in config or we generate it here from service
        if (!this.stimuli) {
            this.stimuli = this.dataGenService.generateIowaGamblingTaskStimuli();
        }
        super.start();
    }

    beginRound() {
        this.timerService.clearTimer();

        this.taskData.push({
            trial: ++this.trialNum,
            userID: this.userID,
            studyId: this.studyId,
            isPractice: false,
            submitted: this.timerService.getCurrentTimestamp(),
            buttonChoice: 0,
            selectButtonResponseTime: 0,
            pressSpaceResponseTime: 0,
            trialHasFee: false,
            moneyInBankBeforeButtonSelection: 0,
            moneyInBankAfterButtonSelection: 0,
            moneyWon: 0,
            feePaid: 0,
        });

        this.timerService.startTimer();
        this.buttonResponseAllowed = true;
    }

    private isValidSpaceKey(key: string): boolean {
        return key === 'Space';
    }

    private isValidButtonKey(key: string): boolean {
        return key === '1' || key === '2' || key === '3' || key === '4';
    }

    @HostListener('window:keyup', ['$event'])
    handleRoundInteraction(event: KeyboardEvent) {
        if (!this.currentTrial?.submitted) return;

        if (this.buttonResponseAllowed && this.isValidButtonKey(event?.key)) {
            this.buttonPressed = parseInt(event.key);
            const thisStimulus = this.currentStimulus;
            this.moneyWon = thisStimulus.moneyWon;
            this.feePaid = thisStimulus.feePaid;
            this.showFeedback = true;

            this.currentTrial.selectButtonResponseTime = this.timerService.stopTimerAndGetTime();
            this.currentTrial.buttonChoice = this.buttonPressed;
            this.currentTrial.feePaid = thisStimulus.feePaid;
            this.currentTrial.moneyWon = thisStimulus.moneyWon;
            this.currentTrial.moneyInBankBeforeButtonSelection = this.totalMoney;
            this.currentTrial.moneyInBankAfterButtonSelection = this.totalMoney + this.moneyWon + this.feePaid;
            this.currentTrial.trialHasFee = this.feePaid < 0;

            this.buttonResponseAllowed = false;
            this.spacebarResponseAllowed = true;
            this.timerService.startTimer();
        } else if (this.spacebarResponseAllowed && this.buttonPressed && this.isValidSpaceKey(event?.code)) {
            this.currentTrial.submitted = this.timerService.getCurrentTimestamp();

            this.currentTrial.pressSpaceResponseTime = this.timerService.stopTimerAndGetTime();
            this.totalMoney = this.totalMoney + this.moneyWon + this.feePaid;
            this.spacebarResponseAllowed = false;
            super.handleRoundInteraction(event.key);
        }
    }

    async completeRound() {
        switch (this.buttonPressed) {
            case 1:
                this.button1Counter++;
                break;
            case 2:
                this.button2Counter++;
                break;
            case 3:
                this.button3Counter++;
                break;
            case 4:
                this.button4Counter++;
                break;
            default:
                break;
        }

        this.buttonPressed = null;

        this.showFeedback = false;
        this.moneyWon = 0;
        this.feePaid = 0;

        this.buttonResponseAllowed = false;
        this.spacebarResponseAllowed = false;

        super.completeRound();
    }

    async decideToRepeat(): Promise<void> {
        // we have reached past the final activity
        const finishedLastStimulus = this.trialNum >= this.numTrials;

        if (finishedLastStimulus) {
            super.decideToRepeat();
            return;
        } else {
            this.beginRound();
            return;
        }
    }
}
