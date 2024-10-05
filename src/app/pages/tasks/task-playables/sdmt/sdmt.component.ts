import { Component, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { thisOrDefault, throwErrIfNotDefined } from 'src/app/common/commonMethods';
import { SDMTData } from 'src/app/models/ParticipantData';
import { StimuliProvidedType } from 'src/app/models/enums';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import {
    SDMTImageEnum,
    SDMTImageToNumberMapping,
    SDMTTaskSimulus,
} from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../base-task';
import { TaskPlayerState } from '../task-player/task-player.component';
import { Key } from 'src/app/models/InternalDTOs';

interface SDMTMetadata {
    componentName: ComponentName;
    componentConfig: {
        isPractice: boolean;
        maxResponseTime: number;
        numRows: number;
        numCols: number;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: SDMTTaskSimulus[][];
        };
    };
}

@Component({
    selector: 'app-sdmt',
    templateUrl: './sdmt.component.html',
    styleUrls: ['./sdmt.component.scss'],
})
export class SdmtComponent extends AbstractBaseTaskComponent {
    // config variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private numRows: number;
    private numCols: number;
    private allHardcodedStimuli: SDMTTaskSimulus[][];

    // high level variables
    taskData: SDMTData[];
    blockNum: number = 0;
    stimuli: SDMTTaskSimulus[][];
    trialNum: number = 0;
    currentStimulusIndex = {
        col: 0,
        row: 0,
    };

    // local state variables
    isLoading: boolean = false;
    responseAllowed: boolean = false;
    feedback: string = '';
    showFeedback: boolean = false;

    // timers
    maxResponseTimer: any;

    get currentStimulus(): SDMTTaskSimulus {
        return this.stimuli[this.currentStimulusIndex.row][this.currentStimulusIndex.col];
    }

    get currentTrial(): SDMTData {
        // will return null if taskData is not defined or if it has length of 0
        return this.taskData?.length > 0 ? this.taskData[this.taskData.length - 1] : null;
    }

    // translation mapping
    translationMapping = {
        tutorialKeyMessage: {
            en: 'In this task, you will need to fill in the blanks based on a key. Below is the key. Each symbol in the top box has a corresponding number in the bottom box.',
            fr: 'Dans ce jeu, vous devrez remplir les blancs à l’aide d’une clé. Voici la clé. Chaque symbole dans la case du haut correspond à un numéro dans la case du bas.',
        },
        tutorialWelcomeHeader: {
            en: 'Welcome to the Symbol game',
            fr: 'Bienvenue au Jeu des symboles',
        },
        tutorialInstructionsMessage: {
            en: 'Below is a PRACTICE. <br />See how the first three are filled in? <br />Fill in the next 6 items using the number keys on our keyboard (1 - 9)',
            fr: 'Ci-dessous se trouve un EXEMPLE. <br /> Voyez comment les trois premières cases sont remplies? <br /> Remplissez les 6 cases suivantes en utilisant les touches numériques de votre clavier (1 - 9)',
        },
        tutorialFeedback: {
            en: 'Please type in the correct number!',
            fr: 'Veuillez saisir le bon numéro!',
        },
    };

    imageToNumberMapping: SDMTImageToNumberMapping = {
        [SDMTImageEnum.IMAGE1]: '1',
        [SDMTImageEnum.IMAGE2]: '2',
        [SDMTImageEnum.IMAGE3]: '3',
        [SDMTImageEnum.IMAGE4]: '4',
        [SDMTImageEnum.IMAGE5]: '5',
        [SDMTImageEnum.IMAGE6]: '6',
        [SDMTImageEnum.IMAGE7]: '7',
        [SDMTImageEnum.IMAGE8]: '8',
        [SDMTImageEnum.IMAGE9]: '9',
    };

    get tutorialWelcomeHeader(): string {
        return this.translationMapping.tutorialWelcomeHeader[this.translateService.currentLang];
    }

    get tutorialKeyMessage(): string {
        return this.translationMapping.tutorialKeyMessage[this.translateService.currentLang];
    }

    get tutorialInstructionsMessage(): string {
        return this.translationMapping.tutorialInstructionsMessage[this.translateService.currentLang];
    }

    get tutorialFeedbackMessage(): string {
        return this.translationMapping.tutorialFeedback[this.translateService.currentLang];
    }

    configure(metadata: SDMTMetadata, config: TaskPlayerState) {
        this.isLoading = true;
        try {
            this.userID = throwErrIfNotDefined(config.userID, 'no user ID defined');
            this.studyId = throwErrIfNotDefined(config.studyID, 'no study code defined');
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }

        this.isPractice = thisOrDefault(metadata.componentConfig.isPractice, false);
        this.maxResponseTime = thisOrDefault(metadata.componentConfig.maxResponseTime, 120000);
        this.numCols = thisOrDefault(metadata.componentConfig.numCols, 16);
        this.numRows = thisOrDefault(metadata.componentConfig.numRows, 9);

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED) {
            const hardcodedData = JSON.parse(JSON.stringify(metadata.componentConfig.stimuliConfig.stimuli));
            this.stimuli = hardcodedData;
            this.allHardcodedStimuli = hardcodedData;
        }

        this.taskData = [];
    }

    async start() {
        // we used this function originally but we now hard code it. I'm leaving this here for provenance as
        // this is the code that originally generated the current hard coded stimuli we use
        // const x = this.dataGenService.generateSDMTStimuli(false, this.imageToNumberMapping);
        if (this.isPractice) {
            // select the fourth box in the practice round as the first three are already answered
            this.currentStimulusIndex = {
                row: 0,
                col: 3,
            };
        } else {
            this.stimuli = [
                this.allHardcodedStimuli[0].slice(this.blockNum * this.numCols, (this.blockNum + 1) * this.numCols),
            ];
            this.currentStimulusIndex = {
                row: 0,
                col: 0,
            };
        }
        super.start();
    }

    beginRound() {
        this.timerService.clearTimer();
        this.isLoading = false;

        this.timerService.startTimer();
        this.responseAllowed = true;

        this.setTimer(this.maxResponseTime, () => {
            this.responseAllowed = false;
            this.isLoading = true;
            if (this.isDestroyed) return;
            super.decideToRepeat();
        });
    }

    private isValidKey(key: string) {
        return (
            key === Key.NUMONE ||
            key === Key.NUMTWO ||
            key === Key.NUMTHREE ||
            key === Key.NUMFOUR ||
            key === Key.NUMFIVE ||
            key === Key.NUMSIX ||
            key === Key.NUMSEVEN ||
            key === Key.NUMEIGHT ||
            key === Key.NUMNINE
        );
    }

    private setTimer(delay: number, cbFunc?: () => void) {
        this.maxResponseTimer = window.setTimeout(() => {
            if (cbFunc) cbFunc();
        }, delay);
    }

    @HostListener('window:keypress', ['$event'])
    handleRoundInteraction(event: KeyboardEvent): void {
        if (event === null) {
            // signal that we want to move on
            super.handleRoundInteraction(null);
            return;
        }
        if (true === !!'true') throw new Error('smth bad');

        // do not allow the user to hold the key down
        if (event.repeat) return;

        if (this.responseAllowed && this.isValidKey(event.key)) {
            this.showFeedback = false;
            this.feedback = '';
            const isCorrect = event.key === this.currentStimulus.expectedNumber;

            this.taskData.push({
                trial: ++this.trialNum,
                userID: this.userID,
                studyId: this.studyId,
                submitted: this.timerService.getCurrentTimestamp(),
                isPractice: this.isPractice,
                isCorrect: isCorrect,
                blockNum: this.blockNum + 1,
                timeFromLastValidKeyPress: this.timerService.stopTimerAndGetTime(),
                imageURL: this.currentStimulus.imageURL,
                actualAnswer: this.currentStimulus.expectedNumber,
                userAnswer: event.key,
            });

            if (this.isPractice && !isCorrect) {
                // show feedback
                this.showFeedback = true;
                this.feedback = this.tutorialFeedbackMessage;
            } else {
                this.currentStimulus.userAnswer = event.key;
                if (
                    // check if we are done with this current block
                    this.currentStimulusIndex.col >= this.stimuli[this.currentStimulusIndex.row].length - 1 &&
                    this.currentStimulusIndex.row >= this.stimuli.length - 1
                ) {
                    super.handleRoundInteraction(null);
                    return;
                }

                if (this.currentStimulusIndex.col >= this.stimuli[this.currentStimulusIndex.row].length - 1) {
                    // increment stimulus index
                    this.currentStimulusIndex.row++;
                    this.currentStimulusIndex.col = 0;
                } else {
                    this.currentStimulusIndex.col++;
                }
            }

            this.timerService.clearTimer();
            this.timerService.startTimer();
        }
    }

    async completeRound() {
        this.responseAllowed = false;
        super.completeRound();
    }

    async decideToRepeat() {
        if (this.isPractice) {
            clearTimeout(this.maxResponseTimer);
            this.isLoading = true;
            super.decideToRepeat();
        } else {
            if (this.taskData.length >= this.allHardcodedStimuli[0].length) {
                super.decideToRepeat();
                this.isLoading = true;
                return;
            }
            this.blockNum++;
            this.start();
        }
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
}
