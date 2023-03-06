import { Component } from '@angular/core';
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
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    showFeedback: boolean;
    totalMoney: number;
    moneyWon: number;
    feePaid: number;
    showStimulus: boolean = false;
    button1Counter: number;
    button2Counter: number;
    button3Counter: number;
    button4Counter: number;

    get currentStimulus(): IowaGamblingTaskStimulus {
        return this.stimuli[this.currentStimuliIndex];
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
        this.button1Counter = 0;
        this.button2Counter = 0;
        this.button3Counter = 0;
        this.button4Counter = 0;

        this.totalMoney = 2000;

        this.currentStimuliIndex = 0;
        this.showStimulus = false;
        this.showFeedback = false;

        this.taskData = [];

        // either the stimuli has been defined in config or we generate it here from service
        if (!this.stimuli) {
            this.stimuli = this.dataGenService.generateIowaGamblingTaskStimuli();
        }
        super.start();
    }

    beginRound() {
        this.timerService.clearTimer();

        this.showStimulus = true;
    }

    handleRoundInteraction() {}

    // constructor() {}

    async completeRound() {}

    async decideToRepeat(): Promise<void> {}
}
