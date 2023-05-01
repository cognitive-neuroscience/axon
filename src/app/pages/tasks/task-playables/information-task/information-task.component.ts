import { Component, HostListener, OnInit } from '@angular/core';
import { AbstractBaseTaskComponent } from '../base-task';
import { TimerService } from 'src/app/services/timer.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { throwErrIfNotDefined } from 'src/app/common/commonMethods';
import { TaskPlayerState } from '../task-player/task-player.component';
import { StimuliProvidedType } from 'src/app/models/enums';
import { ComponentName } from 'src/app/services/component-factory.service';
import { InformationTaskStimuli } from 'src/app/services/data-generation/raw-data/information-task-stimuli-list';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { InformationTaskData } from 'src/app/models/ParticipantData';

interface InformationTaskMetadata {
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
                1: {
                    optimalSolution: number;
                    deck: number[];
                };
                2: {
                    optimalSolution: number;
                    deck: number[];
                };
                3: {
                    optimalSolution: number;
                    deck: number[];
                };
                4: {
                    optimalSolution: number;
                    deck: number[];
                };
                5: {
                    optimalSolution: number;
                    deck: number[];
                };
                6: {
                    optimalSolution: number;
                    deck: number[];
                };
            };
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
    private deckNum: number; // determines which deck to use (1-6), translates into blockNum

    // high level variables
    taskData: InformationTaskData[];
    stimuli: {
        1: {
            optimalSolution: number;
            deck: number[];
        };
        2: {
            optimalSolution: number;
            deck: number[];
        };
        3: {
            optimalSolution: number;
            deck: number[];
        };
        4: {
            optimalSolution: number;
            deck: number[];
        };
        5: {
            optimalSolution: number;
            deck: number[];
        };
        6: {
            optimalSolution: number;
            deck: number[];
        };
    };

    // local state variables
    blockNum: number = 0;

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
        } catch (error) {
            throw new Error('values not defined, cannot start study');
        }

        this.config = config;
        if (metadata.componentConfig.stimuliConfig.type === StimuliProvidedType.HARDCODED)
            this.stimuli = metadata.componentConfig.stimuliConfig.stimuli;
    }

    start(): void {
        // configure game
    }

    beginRound() {}

    @HostListener('window:keyup', ['$event'])
    handleRoundInteraction(event: KeyboardEvent) {}

    async completeRound() {}

    async decideToRepeat(): Promise<void> {}
}
