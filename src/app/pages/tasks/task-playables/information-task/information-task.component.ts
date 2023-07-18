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
import { TranslateService } from '@ngx-translate/core';

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

export enum InformationTaskCache {
    TOTAL_SCORE = 'information-task-total-score',
    OPTIMAL_SCORE = 'information-task-optimal-score',
    STATUS_TEXT = 'information-task-status-text',
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
    cardsDrawn: number[];
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

    get largestDrawnCardValue(): number {
        return this.cardsDrawn.reduce((acc, curr) => (curr > acc ? curr : acc), 0);
    }

    get totalPoints(): number {
        return this.valuesSelected.reduce((acc, curr) => acc + curr, 0);
    }

    // translation mapping
    translationMapping = {
        scoreStatusTextLower: {
            en: 'You scored lower',
            fr: 'Vous avez obtenu un score inférieur',
        },
        scoreStatusTextEqual: {
            en: 'You scored equal!',
            fr: 'Vous avez obtenu un score égal!',
        },
        scoreStatusTextHigher: {
            en: 'You scored higher!',
            fr: 'Vous avez obtenu un score supérieur!',
        },
        numCardsText: {
            en: 'cards in the deck',
            fr: 'cartes dans le jeu',
        },
        titleInstructionsText: {
            en: 'Click on the deck or an uncovered card',
            fr: 'Cliquez sur le jeu ou sur une carte découverte',
        },
        turnsTakenText: {
            en: 'Turns taken',
            fr: 'Tours effectués',
        },
        turnsLeftText: {
            en: 'Turns left',
            fr: 'Tours restants',
        },
        totalPointsText: {
            en: 'Total points',
            fr: 'Score final',
        },
    };

    getTranslation(key: keyof typeof this.translationMapping): string | undefined {
        return this.translationMapping[key][this.translateService.currentLang];
    }

    constructor(
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService,
        private translateService: TranslateService
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
        console.log(this.stimuli);
        // configure game
        this.taskStarted = true;

        this.taskData = [];
        this.cardsDrawn = [];
        this.valuesSelected = [];
        this.currentStimuliIndex = 0;
        this.trialNum = 0;

        this.roundStartTime = Date.now();
        super.start();
    }

    beginRound() {
        this.timerService.clearTimer();
        this.timerService.startTimer();
    }

    handleRoundInteraction(cardType: 'newCard' | 'existingCard', existingCardVal?: number) {
        if (!this.taskStarted) return;

        const newCardVal = this.currentStimulus;

        let cardValue: number;
        if (cardType === 'newCard') {
            this.cardsDrawn.push(newCardVal.cardValue);
            cardValue = newCardVal.cardValue;
        } else {
            cardValue = existingCardVal;
        }

        this.valuesSelected.push(cardValue);

        this.taskData.push({
            userID: this.userID,
            studyId: this.studyId,
            submitted: this.timerService.getCurrentTimestamp(),
            isPractice: this.isPractice,
            trial: ++this.trialNum,
            roundNum: this.roundNum,
            trialScore: cardValue,
            cumulativeRoundLength: Date.now() - this.roundStartTime,
            cumulativeRoundScore:
                this.taskData.length <= 0
                    ? cardValue
                    : this.taskData[this.taskData.length - 1].cumulativeRoundScore + cardValue,
            exploited: cardType === 'existingCard',
            expectedToExploit: newCardVal.expectedToExploit,
            trialResponseTime: this.timerService.stopTimerAndGetTime(),
        });
        super.handleRoundInteraction(null);
    }

    async completeRound() {
        super.completeRound();
    }

    async decideToRepeat(): Promise<void> {
        if (this.trialNum >= this.numTrials) {
            this.taskStarted = false;
            const totalScore = this.taskData.reduce((acc, currVal) => {
                return acc + currVal.trialScore;
            }, 0);

            const optimalScore = this.stimuli.optimalScore;

            console.log({ totalScore, optimalScore });

            const statusText =
                totalScore < optimalScore
                    ? this.translationMapping.scoreStatusTextLower[this.translateService.currentLang]
                    : totalScore === optimalScore
                    ? this.translationMapping.scoreStatusTextEqual[this.translateService.currentLang]
                    : this.translationMapping.scoreStatusTextHigher[this.translateService.currentLang];

            // this will replace the previous round
            this.config.setCacheValue(InformationTaskCache.TOTAL_SCORE, totalScore);
            this.config.setCacheValue(InformationTaskCache.OPTIMAL_SCORE, optimalScore);
            this.config.setCacheValue(InformationTaskCache.STATUS_TEXT, statusText);

            super.decideToRepeat();
        } else {
            this.currentStimuliIndex++;
            this.beginRound();
            return;
        }
    }
}
