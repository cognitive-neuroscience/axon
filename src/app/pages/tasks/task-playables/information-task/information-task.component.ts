import { Component, HostListener, OnInit } from '@angular/core';
import { AbstractBaseTaskComponent } from '../base-task';
import { TimerService } from 'src/app/services/timer.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { thisOrDefault, throwErrIfNotDefined } from 'src/app/common/commonMethods';
import { TaskPlayerState } from '../task-player/task-player.component';
import { StimuliProvidedType } from 'src/app/models/enums';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { InformationTaskData } from 'src/app/models/ParticipantData';
import { InformationTaskStimuliSet, InformationTaskStimulus } from 'src/app/services/data-generation/stimuli-models';

interface InformationTaskMetadata {
    componentName: ComponentName;
    componentConfig: {
        numTrials: number;
        roundNum: number;
        isPractice: boolean;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: InformationTaskStimuliSet;
        };
    };
}

@Component({
    selector: 'app-information-task',
    templateUrl: './information-task.component.html',
    styleUrls: ['./information-task.component.scss'],
})
export class InformationTaskComponent extends AbstractBaseTaskComponent {
    // config variables variables
    private numTrials: number;
    private roundNum: number; // determines which deck to use (1-6), translates into blockNum
    private isPractice: boolean;

    // high level variables
    taskData: InformationTaskData[];
    stimuli: InformationTaskStimuliSet;
    currentStimuliIndex: number = 0;
    largestValue: number = 0;
    cardsSelected: number[];
    deckIndex: number = 0;
    valuesSelected: number[];
    taskStarted: boolean = false;
    roundStartTime: number;
    trialNum: number = 0;

    // local state variables

    get currentStimulus(): InformationTaskStimulus {
        return this.stimuli.cardValues[this.currentStimuliIndex];
    }

    get currentTrial(): InformationTaskData {
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

    configure(metadata: InformationTaskMetadata, config?: TaskPlayerState) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');

            this.numTrials = throwErrIfNotDefined(metadata.componentConfig.numTrials, 'num trials not defined');
            this.roundNum = throwErrIfNotDefined(metadata.componentConfig.roundNum, 'roundNum is not defined');
            this.isPractice = thisOrDefault(metadata.componentConfig.isPractice, false);
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }

        this.config = config;
        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    start(): void {
        // configure game
        this.taskStarted = true;

        this.taskData = [];
        this.cardsSelected = [];
        this.valuesSelected = [];
        this.largestValue = 0;
        this.currentStimuliIndex = 0;
        this.trialNum = 0;
        this.deckIndex = 0;

        this.roundStartTime = Date.now();
        super.start();
    }

    beginRound() {
        this.timerService.clearTimer();
        this.timerService.startTimer();
    }

    handleRoundInteraction(cardType: 'newCard' | 'existingCard', cardVal?: number) {
        if (!this.taskStarted) return;

        if (cardType === 'newCard') {
            const newCardVal = this.currentStimulus;
            this.cardsSelected.push(newCardVal.cardValue);
            this.deckIndex++;

            this.taskData.push({
                userID: this.userID,
                studyId: this.studyId,
                submitted: this.timerService.getCurrentTimestamp(),
                isPractice: this.isPractice,
                trial: ++this.trialNum,
                roundNum: this.roundNum,
                trialScore: newCardVal.cardValue,
                cumulativeRoundLength: this.roundStartTime - Date.now(),
                cumulativeRoundScore:
                    this.taskData.length <= 0
                        ? newCardVal.cardValue
                        : this.taskData[this.taskData.length - 1].cumulativeRoundScore + newCardVal.cardValue,
                exploited: false,
                expectedToExploit: newCardVal.expectedToExploit,
                trialResponseTime: this.timerService.stopTimerAndGetTime(),
            });
        } else {
        }
        this.timerService.clearTimer();
        this.timerService.startTimer();
    }

    async completeRound() {}

    async decideToRepeat(): Promise<void> {}
}
