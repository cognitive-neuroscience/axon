import { Component } from '@angular/core';
import { StimuliProvidedType } from 'src/app/models/enums';
import { Feedback } from 'src/app/models/InternalDTOs';
import { SARTTaskData } from 'src/app/models/TaskData';
import { ComponentName } from 'src/app/services/component-factory.service';
import { DataGenerationService } from 'src/app/services/data-generation/data-generation.service';
import { SARTStimuliSetType, SARTStimulus } from 'src/app/services/data-generation/stimuli-models';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TimerService } from 'src/app/services/timer.service';
import { AbstractBaseTaskComponent } from '../base-task';

export interface SARTMetadata {
    component: ComponentName;
    config: {
        isPractice: boolean;
        maxResponseTime: number;
        interTrialDelay: number;
        durationFeedbackPresented: number;
        durationStimulusPresented: number;
        trialSize: number;
        stimuliSetType: SARTStimuliSetType;
        stimuliConfig: {
            type: StimuliProvidedType;
            stimuli: SARTStimulus[];
        };
    };
}

@Component({
    selector: 'app-sart',
    templateUrl: './sart.component.html',
    styleUrls: ['./sart.component.scss'],
})
export class SartComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves two conditions: ASCENDING and RAND. The participant sees a sequence of digits one after the other. They must left click
     * for all digits they see except for the number 3 - the NOGO stimulus.
     * In the ASCENDING condition, number 1 - 9 are shown to the participant sequentially in order.
     * In the RANDOM condition, numbers 1 - 9 are shown to the participant sequentially in random order.
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private interTrialDelay: number;
    private durationFeedbackPresented: number;
    private durationStimulusPresented: number;
    private trialSize: number;
    private stimuliSetType: SARTStimuliSetType;

    // high level variables
    counterbalance: SARTStimuliSetType;
    taskData: SARTTaskData[];
    stimuli: SARTStimulus[];
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    blockNum: number = 0;
    feedback: Feedback;
    showStimulus: boolean = false;
    showFeedback: boolean = false;
    showResponseCue: boolean = false;
    trialNum: number = 0;
    responseAllowed: boolean = false;

    // timers
    maxResponseTimer: any;

    get currentStimulus(): SARTStimulus {
        return this.stimuli[this.currentStimuliIndex];
    }

    get currentTrial(): SARTTaskData {
        return this.taskData[this.taskData.length - 1];
    }

    configure(metadata: any, config?: any) {
        throw new Error('Method not implemented.');
    }
    beginRound() {
        throw new Error('Method not implemented.');
    }

    constructor(
        protected snackbarService: SnackbarService,
        protected timerService: TimerService,
        protected dataGenService: DataGenerationService,
        protected loaderService: LoaderService
    ) {
        super(loaderService);
    }

    ngOnInit(): void {}
}
