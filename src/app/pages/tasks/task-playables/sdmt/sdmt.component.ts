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

    showLoaderOnInitDuration = 2000;

    // high level variables
    taskData: SDMTData[];
    stimuli: SDMTTaskSimulus[][];
    currentStimulus = {
        col: 0,
        row: 0,
    };

    // local state variables
    isLoading: boolean = false;

    // translation mapping
    translationMapping = {
        tutorialKeyMessage: {
            en: 'In this task, you will need to fill in the blanks based on a key. Below is the key. Each symbol in the top box has a corresponding number in the bottom box.',
            fr: '...en francais',
        },
        tutorialInstructionsMessage: {
            en: 'Below is a PRACTICE. <br />See how the first three are filled in? <br />Fill in the next 6 items using the number keys on our keyboard (1 - 9)',
            fr: '...en francais',
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

    get tutorialKeyMessage(): string {
        return this.translationMapping.tutorialKeyMessage[this.translateService.currentLang];
    }

    get tutorialInstructionsMessage(): string {
        return this.translationMapping.tutorialInstructionsMessage[this.translateService.currentLang];
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

        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    async start() {
        this.taskData = [];
        this.stimuli = this.dataGenService.generateSDMTStimuli(
            this.isPractice,
            this.imageToNumberMapping,
            this.numRows,
            this.numCols
        );
        console.log({
            stimuli: this.stimuli,
        });
        super.start();
    }

    beginRound() {
        this.isLoading = false;
        console.log('BEGIN ROUND');
    }

    private isValidKey(key: string) {
        return true;
    }

    @HostListener('window:keypress', ['$event'])
    handleRoundInteraction(event: KeyboardEvent): void {}

    async completeRound() {}

    async decideToRepeat() {}

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
