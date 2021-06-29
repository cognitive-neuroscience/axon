import { Component, HostListener } from "@angular/core";
import { thisOrDefault, throwErrIfNotDefined } from "src/app/common/commonMethods";
import { StimuliProvidedType } from "src/app/models/enums";
import { Key } from "src/app/models/InternalDTOs";
import { FingerTappingTaskData } from "src/app/models/TaskData";
import { ComponentName } from "src/app/services/component-factory.service";
import { LoaderService } from "src/app/services/loader/loader.service";
import { TimerService } from "src/app/services/timer.service";
import { AbstractBaseTaskComponent } from "../base-task";
import { TaskConfig } from "../task-player/task-player.component";

interface FingerTappingMetadata {
    component: ComponentName;
    config: {
        isPractice: boolean;
        maxResponseTime: number;
        durationFixationPresented: number;
        useHand: UseHand;
    };
}

export enum UseHand {
    DOMINANT = "DOMINANT",
    NON_DOMINANT = "NONDOMINANT",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    BOTH = "BOTH",
}

export enum FingerTappingCache {
    HANDEDNESS = "finger-tapping-handedness",
    BLOCK_NUM = "finger-tapping-block-num",
}

@Component({
    selector: "app-finger-tapping-task",
    templateUrl: "./finger-tapping-task.component.html",
    styleUrls: ["./finger-tapping-task.component.scss"],
})
export class FingerTappingTaskComponent extends AbstractBaseTaskComponent {
    /**
     * Task summary:
     * This task involves the participant using the "P" and "Q" keys. They use one hand to
     * alternatively tap the two keys.
     * This task is counterbalanced by hand.
     */

    // config variables variables
    isPractice: boolean = false;
    private maxResponseTime: number;
    private durationFixationPresented: number;
    private useHand: UseHand;

    // shared state variables
    userID: string;
    studyCode: string;
    config: TaskConfig;

    // high level variables
    taskData: FingerTappingTaskData[];
    stimuli = null; // not used
    currentStimuliIndex: number; // index of the stimuli we are on

    // local state variables
    blockNum: number;
    handedness: UseHand;
    showStimulus: boolean = false;
    text: string;
    color: string;
    showFeedback: boolean = false;
    showFixation: boolean = false;
    responseAllowed: boolean = false;
    trialNum: number = 0;
    lastKeyPressed: Key;

    // timers
    maxResponseTimer: any;
    fixationTimeout: any;

    constructor(protected timerService: TimerService, protected loaderService: LoaderService) {
        super(loaderService);
    }

    configure(metadata: FingerTappingMetadata, config: TaskConfig) {
        try {
            this.userID = throwErrIfNotDefined(config.userID, "no user ID defined");
            this.studyCode = throwErrIfNotDefined(config.studyCode, "no study code defined");

            this.maxResponseTime = throwErrIfNotDefined(
                metadata.config.maxResponseTime,
                "max response time not defined"
            );
            this.useHand = throwErrIfNotDefined(metadata.config.useHand, "use hand not defined");
        } catch (error) {
            throw new error("values not defined, cannot start study");
        }

        this.config = config;
        this.isPractice = thisOrDefault(metadata.config.isPractice, false);
        this.durationFixationPresented = thisOrDefault(metadata.config.durationFixationPresented, 50);

        // no stimuli required for this task
    }

    async start() {
        await this.startGameInFullScreen();
        if (this.isDestroyed) return;

        this.taskData = [];
        this.currentStimuliIndex = 0;

        this.handedness = this.config.getCacheValue(FingerTappingCache.HANDEDNESS) || UseHand.RIGHT;
        this.blockNum = this.config.getCacheValue(FingerTappingCache.BLOCK_NUM) || 1; // set to 1 if not defined
        // no stimuli

        super.start();
    }

    private flashFixation() {
        this.showFixation = true;
        this.fixationTimeout = window.setTimeout(() => {
            this.showFixation = false;
            clearTimeout(this.fixationTimeout);
        }, this.durationFixationPresented);
    }

    private isValidKey(key: string): boolean {
        return key === Key.Q || key === Key.P;
    }

    async beginRound() {
        this.timerService.clearTimer();
        this.timerService.startTimer();
        this.showStimulus = true;
        this.responseAllowed = true;

        this.maxResponseTimer = window.setTimeout(() => {
            this.handleRoundInteraction(null);
        }, this.maxResponseTime);
    }

    @HostListener("window:keypress", ["$event"])
    handleRoundInteraction(event: KeyboardEvent) {
        if (event === null) {
            super.handleRoundInteraction(null);
        } else if (this.responseAllowed && this.isValidKey(event.key)) {
            const responseTime = this.timerService.stopTimerAndGetTime();

            this.taskData.push({
                trial: ++this.trialNum,
                userID: this.userID,
                submitted: this.timerService.getCurrentTimestamp(),
                isPractice: this.isPractice,
                isCorrect: event.key !== this.lastKeyPressed,
                studyCode: this.studyCode,
                block: this.blockNum,
                dominantHand: this.handedness,
                handUsed: this.useHand,
                timeFromLastKeyPress: responseTime,
                keyPressed: event.key as Key,
            });
            // for first press of the game lastKey will be null
            if (this.lastKeyPressed !== event.key) {
                this.flashFixation();
                this.lastKeyPressed = event.key as Key;
            }
            this.timerService.startTimer();
        }
    }

    private cancelAllTimers() {
        clearTimeout(this.maxResponseTimer);
    }

    async completeRound() {
        this.cancelAllTimers();
        this.showStimulus = false;
        this.responseAllowed = false;

        super.completeRound();
    }

    async decideToRepeat() {
        this.config.setCacheValue(FingerTappingCache.BLOCK_NUM, this.isPractice ? this.blockNum : ++this.blockNum);
        super.decideToRepeat();
        return;
    }
}
