import { Component, OnInit, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { ParticipantDataService } from "src/app/services/participant-data.service";
import { TaskManagerService } from "../../../../services/task-manager.service";
import { AuthService } from "../../../../services/auth.service";
import { SnackbarService } from "../../../../services/snackbar.service";
import { TaskData, TaskNames } from "../../../../models/TaskData";
import { pracSet } from "./stimuli_practice";
import { taskSet } from "./stimuli_task";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { Key, UserResponse } from "src/app/models/InternalDTOs";
import { TimerService } from "src/app/services/timer.service";
import { getRandomNumber, wait } from "src/app/common/commonMethods";
import { environment } from "src/environments/environment";

declare function setFullScreen(): any;

class RatingTask extends TaskData {
    counterbalance: number;
    ratingType: string;
    activity: string;
    userAnswer: string;
    responseTime: number;
}

@Component({
    selector: "app-rating-task",
    templateUrl: "./rating.component.html",
    styleUrls: ["./rating.component.scss"],
})
export class RatingComponent implements OnInit {
    isScored: boolean | number = false;
    showScoreAfterEveryTrial: boolean | number = false;
    maxResponseTime: number = 30000;
    interTrialDelay: number = 1000; // In milliseconds
    practiceTrials: number = 1;
    actualTrials: number = 45; //change into number of activities
    delayToShowHelpMessage: number = 20000; //delay to show help message
    durationHelpMessageShown: number = 10000;

    step: number = 1;
    currentActivity: string = "";
    currentSet: string[];
    partOneComplete: boolean = false;

    isPractice: boolean = false;
    isStimulus: boolean = false;
    isRatingscale: boolean = false;
    isBreak: boolean = false;
    currentTrial: number = 0;
    isResponseAllowed: boolean = false;
    data: RatingTask[] = [];

    // counterbalance of 0 = LIKE --> SHOULD
    // counterbalance of 1 = SHOULD --> LIKE
    counterbalance: number;
    showFixation: boolean = false;
    sTimeout: any;
    snackbarTimeout: any;

    @HostListener("window:keypress", ["$event"])
    onKeyPress(event: KeyboardEvent) {
        if (this.isResponseAllowed && this.isValidKey(event.key)) {
            this.cancelHelpMessage();
            clearTimeout(this.sTimeout);
            this.isResponseAllowed = false;
            const thisTrial = this.data[this.data.length - 1];

            thisTrial.responseTime = this.timerService.stopTimerAndGetTime();
            thisTrial.submitted = this.timerService.getCurrentTimestamp();
            thisTrial.userAnswer = event.key;

            this.showFeedback();
        }
    }

    constructor(
        private router: Router,
        private uploadDataService: ParticipantDataService,
        private taskManager: TaskManagerService,
        private snackbarService: SnackbarService,
        private authService: AuthService,
        private timerService: TimerService
    ) {}

    ngOnInit() {
        this.counterbalance = getRandomNumber(0, 2); // upperbound exclusive
    }

    proceedtoPreviousStep() {
        this.step -= 1;
    }

    proceedtoNextStep() {
        this.step += 1;
    }

    async startPractice() {
        this.startGameInFullScreen();
        this.proceedtoNextStep();
        await wait(2000);
        this.currentSet = this.shuffleStimulus(pracSet);
        this.practiceTrials = this.currentSet.length;
        this.proceedtoNextStep();
        this.isPractice = true;
        this.currentTrial = 0;
        this.showStimulus();
    }

    async startActualGame() {
        this.proceedtoNextStep();
        await wait(2000);
        this.currentSet = this.shuffleStimulus(environment.production ? taskSet : taskSet.slice(0, 5));
        this.actualTrials = this.currentSet.length;
        this.proceedtoNextStep();
        this.isPractice = false;
        this.currentTrial = 0;
        this.showStimulus();
    }

    async showStimulus() {
        this.reset();
        this.showFixation = false;
        await wait(500);

        this.currentTrial += 1;
        this.generateStimulus();

        this.isStimulus = true;
        await wait(1500);
        this.isRatingscale = true;

        // This is the delay between showing the stimulus and showing the feedback
        this.sTimeout = setTimeout(() => {
            // If no response during response window, showing a reminder to respond in time next trial
            const message = "Please do your best to provide your answer in the time allotted for the next trial.";
            this.snackbarService.openInfoSnackbar(message, undefined, this.interTrialDelay);
            this.showFeedback();
        }, this.maxResponseTime);

        this.timerService.startTimer();
        this.isResponseAllowed = true;

        this.showHelpMessage(
            "Please make the rating by pressing the corresponding number key",
            this.delayToShowHelpMessage,
            this.durationHelpMessageShown
        );
    }

    private isValidKey(key: string): boolean {
        switch (key) {
            case Key.NUMONE:
            case Key.NUMTWO:
            case Key.NUMTHREE:
            case Key.NUMFOUR:
            case Key.NUMFIVE:
                return true;
            default:
                return false;
        }
    }

    private showHelpMessage(helpMessage: string, delay: number, duration: number) {
        this.snackbarTimeout = setTimeout(() => {
            this.snackbarService.openErrorSnackbar(helpMessage, "", duration);
        }, delay);
    }

    private cancelHelpMessage() {
        this.snackbarService.clearSnackbar();
        clearTimeout(this.snackbarTimeout);
    }

    private shuffleStimulus(array: string[]) {
        let currentIndex = array.length,
            temporaryValue: string,
            randomIndex: number;

        // While there remain elements to shuffle
        while (0 !== currentIndex) {
            // Pick a remaining element
            randomIndex = getRandomNumber(0, currentIndex);
            currentIndex--;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    generateStimulus() {
        this.currentActivity = this.currentSet[this.currentTrial - 1];

        this.data.push({
            trial: this.currentTrial,
            userID: this.authService.getDecodedToken().UserID,
            counterbalance: this.counterbalance,
            ratingType:
                this.counterbalance == 0
                    ? this.partOneComplete
                        ? "should"
                        : "like"
                    : this.partOneComplete
                    ? "like"
                    : "should",
            userAnswer: UserResponse.NA,
            activity: this.currentActivity,
            responseTime: 0,
            submitted: this.timerService.getCurrentTimestamp(),
            isPractice: this.isPractice,
            studyCode: null,
        });
    }

    async showFeedback() {
        this.isStimulus = false;
        this.isRatingscale = false;
        this.isResponseAllowed = false;

        const thisTrial = this.data[this.data.length - 1];

        if (thisTrial.userAnswer === UserResponse.NA) {
            thisTrial.responseTime = this.maxResponseTime;
        }

        this.decideToContinue();
    }

    async decideToContinue() {
        if (this.isPractice) {
            if (this.currentTrial < this.practiceTrials) {
                this.continueGame();
            } else {
                this.proceedtoNextStep();
                await wait(2000);
                this.proceedtoNextStep();
            }
        } else {
            if (this.currentTrial < this.actualTrials) {
                this.continueGame();
            } else {
                if (!this.partOneComplete) {
                    this.partOneComplete = true;
                    this.proceedtoNextStep(); //loader
                    await wait(2000);
                    this.proceedtoNextStep(); //show first part complete msg
                    return;
                } else {
                    this.proceedtoNextStep();
                    if (this.authService.isAdmin()) {
                        this.proceedtoNextStep();
                    } else {
                        this.uploadResults(this.data).subscribe(
                            (ok) => {
                                if (ok) {
                                    this.proceedtoNextStep();
                                } else {
                                    this.router.navigate(["/login/mturk"]);
                                    console.error("There was an error uploading the results");
                                    this.snackbarService.openErrorSnackbar("There was an error uploading the results");
                                }
                            },
                            (err) => {
                                this.router.navigate(["/login/mturk"]);
                                console.log("There was an error uploading the results");
                                this.snackbarService.openErrorSnackbar("There was an error uploading the results");
                            }
                        );
                    }
                }
            }
        }
    }

    resume() {
        this.reset();
        this.isBreak = false;
        this.continueGame();
    }

    async continueGame() {
        await wait(this.interTrialDelay);
        this.showStimulus();
    }

    uploadResults(data: RatingTask[]): Observable<boolean> {
        return of(false);
        // const studyCode = this.taskManager.getStudyCode();
        // return this.uploadDataService.uploadTaskData(studyCode, TaskNames.RATING, data).pipe(map((ok) => ok.ok));
    }

    continueAhead() {
        console.log(this.data);

        if (this.authService.isAdmin()) {
            this.router.navigate(["/dashboard/components"]);
            this.snackbarService.openInfoSnackbar("Task completed");
        } else {
            this.taskManager.next();
        }
    }

    reset() {
        this.timerService.clearTimer();
        this.currentActivity = "";
    }

    startGameInFullScreen() {
        setFullScreen();
    }
}
