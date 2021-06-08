import { Component, OnInit, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { NBack } from "src/app/models/TaskData";
import { UploadDataService } from "src/app/services/uploadData.service";
declare function setFullScreen(): any;
import * as Set1 from "./stimuli_1_1";
import * as Set2 from "./stimuli_2_1";
import * as Set3 from "./stimuli_3_1";
import * as Set4 from "./stimuli_4_1";
import * as PracticeSet from "./stimuli_practice";
import { TaskManagerService } from "../../../../services/task-manager.service";
import { map, take } from "rxjs/operators";
import { AuthService } from "../../../../services/auth.service";
import { SnackbarService } from "../../../../services/snackbar.service";
import { Key } from "src/app/models/InternalDTOs";
import { NBackStimuli, TaskNames } from "../../../../models/TaskData";
import { TimerService } from "../../../../services/timer.service";
import { UserResponse, Feedback } from "../../../../models/InternalDTOs";
import { environment } from "../../../../../environments/environment";
import { Role } from "src/app/models/enums";

@Component({
    selector: "app-n-back",
    templateUrl: "./n-back.component.html",
    styleUrls: ["./n-back.component.scss"],
})
export class NBackComponent implements OnInit {
    // Default study config
    isScored: boolean | number = true;
    showFeedbackAfterEveryTrial: boolean | number = true;
    showScoreAfterEveryTrial: boolean | number = false;
    numberOfBreaks: number = 0;
    maxResponseTime: number = 2000; // In milliseconds
    durationOfFeedback: number = 500; // In milliseconds
    interTrialDelay: number = 1000; // In milliseconds
    practiceTrials: number = environment.production ? 15 : 5;
    actualTrials: number = environment.production ? 70 : 10;

    step: number = 1;
    feedback: string = "";
    scoreForSpecificTrial: number = 0;
    totalScore: number = 0;
    isPractice: boolean = false;
    isStimulus: boolean = false;
    isBreak: boolean = false;
    currentTrial: number = 0;
    isResponseAllowed: boolean = false;
    data: NBack[] = [];
    set: number;
    showFixation: boolean = false;
    sTimeout: any;
    feedbackShown: boolean = false;
    currentLetter: string;
    nback: string;

    @HostListener("window:keydown", ["$event"])
    onKeyPress(event: KeyboardEvent) {
        if (this.isValidKey(event.key) && this.isResponseAllowed) {
            clearTimeout(this.sTimeout);
            this.isResponseAllowed = false;
            const lastElement = this.data[this.data.length - 1];
            lastElement.responseTime = this.timerService.stopTimerAndGetTime();
            lastElement.submitted = this.timerService.getCurrentTimestamp();
            switch (event.key) {
                case Key.ARROWLEFT:
                    lastElement.userAnswer = UserResponse.NO;
                    break;
                case Key.ARROWRIGHT:
                    lastElement.userAnswer = UserResponse.YES;
                    break;
            }
            this.showFeedback();
        }
    }

    private isValidKey(key: string): boolean {
        if (!key) return false;
        if (key === Key.ARROWLEFT || key === Key.ARROWRIGHT) {
            return true;
        }
    }

    constructor(
        private router: Router,
        private uploadDataService: UploadDataService,
        private taskManager: TaskManagerService,
        private authService: AuthService,
        private snackbarService: SnackbarService,
        private timerService: TimerService
    ) {}

    ngOnInit() {
        this.set = Math.floor(Math.random() * 4) + 1;
    }

    proceedtoPreviousStep() {
        this.step -= 1;
    }

    proceedtoNextStep() {
        this.step += 1;
    }

    async startPractice() {
        this.startGameInFullScreen();
        this.resetData();
        this.proceedtoNextStep();
        await this.wait(2000);
        this.proceedtoNextStep();
        this.isPractice = true;
        this.currentTrial = 0;
        this.showStimulus();
    }

    async startActualGame() {
        this.resetData();
        this.proceedtoNextStep();
        await this.wait(2000);
        this.proceedtoNextStep();
        this.isPractice = false;
        this.currentTrial = 0;
        this.showStimulus();
    }

    async showStimulus() {
        this.reset();
        this.timerService.clearTimer();
        this.showFixation = true;
        await this.wait(500);
        this.showFixation = false;
        await this.wait(200);

        this.currentTrial += 1;
        this.generateStimulus();
        this.isStimulus = true;
        this.isResponseAllowed = true;

        this.timerService.startTimer();

        // This is the delay between showing the stimulus and showing the feedback
        this.sTimeout = setTimeout(() => {
            if (!this.feedbackShown) {
                this.showFeedback();
            }
        }, this.maxResponseTime);
    }

    generateStimulus() {
        const setNum = this.isPractice ? 0 : this.set;
        let selectedSet: NBackStimuli;
        switch (setNum) {
            case 1:
                selectedSet = Set1;
                break;
            case 2:
                selectedSet = Set2;
                break;
            case 3:
                selectedSet = Set3;
                break;
            case 4:
                selectedSet = Set4;
                break;
            default:
                selectedSet = PracticeSet;
                break;
        }

        this.currentLetter = selectedSet.set[this.currentTrial - 1].currentLetter;
        this.nback = selectedSet.set[this.currentTrial - 1].nback;

        this.data.push({
            trial: this.currentTrial,
            userID: this.authService.getDecodedToken().UserID,
            actualAnswer: this.currentLetter === this.nback ? UserResponse.YES : UserResponse.NO,
            userAnswer: UserResponse.NA,
            responseTime: 0,
            isCorrect: false,
            score: 0,
            set: this.set,
            submitted: this.timerService.getCurrentTimestamp(),
            isPractice: this.isPractice,
            studyCode: this.taskManager.getStudyCode(),
        });
    }

    async showFeedback() {
        this.feedbackShown = true;
        this.isStimulus = false;
        this.isResponseAllowed = false;

        const actualAnswer = this.data[this.data.length - 1].actualAnswer;
        const userAnswer = this.data[this.data.length - 1].userAnswer;

        switch (userAnswer) {
            case actualAnswer:
                this.feedback = Feedback.CORRECT;
                this.data[this.data.length - 1].isCorrect = true;
                this.data[this.data.length - 1].score = 10;
                this.scoreForSpecificTrial = 10;
                this.totalScore += 10;
                break;
            case UserResponse.NA:
                this.feedback = Feedback.TOOSLOW;
                this.data[this.data.length - 1].responseTime = this.maxResponseTime;
                this.scoreForSpecificTrial = 0;
                break;
            default:
                this.feedback = Feedback.INCORRECT;
                this.scoreForSpecificTrial = 0;
                break;
        }
        // show feedback either if it is a practice trial, or if the feedback is telling the user
        // they are too slow. Don't show for other feedback during actual game
        if (this.isPractice || (this.showFeedbackAfterEveryTrial && this.feedback === Feedback.TOOSLOW)) {
            await this.wait(this.durationOfFeedback);
        }
        this.decideToContinue();
    }

    async decideToContinue() {
        if (this.isPractice) {
            if (this.currentTrial < this.practiceTrials) {
                this.continueGame();
            } else {
                this.proceedtoNextStep();
                await this.wait(2000);
                this.proceedtoNextStep();
            }
        } else {
            if (this.currentTrial < this.actualTrials) {
                if (this.numberOfBreaks === 0) {
                    this.continueGame();
                } else {
                    const breakAtTrailIndices = [];
                    const setSize = this.actualTrials / (this.numberOfBreaks + 1);
                    for (let i = 1; i < this.numberOfBreaks + 1; i++) {
                        breakAtTrailIndices.push(setSize * i);
                    }
                    if (breakAtTrailIndices.includes(this.currentTrial)) {
                        this.isBreak = true;
                    } else {
                        this.isBreak = false;
                        this.continueGame();
                    }
                }
            } else {
                this.proceedtoNextStep();

                const decodedToken = this.authService.getDecodedToken();

                // if admin, then this task is in debug mode and we do not want to upload tasks
                if (decodedToken.Role === Role.ADMIN) {
                    this.proceedtoNextStep();
                } else {
                    this.uploadResults(this.data)
                        .pipe(take(1))
                        .subscribe(
                            (ok) => {
                                if (ok) {
                                    this.proceedtoNextStep();
                                } else {
                                    console.error("There was an error downloading results");
                                    this.taskManager.handleErr();
                                }
                            },
                            (err) => {
                                console.error("There was an error downloading results");
                                this.taskManager.handleErr();
                            }
                        );
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
        await this.wait(this.interTrialDelay);
        this.showStimulus();
    }

    uploadResults(data: NBack[]): Observable<boolean> {
        const studyCode = this.taskManager.getStudyCode();
        return this.uploadDataService.uploadData(studyCode, TaskNames.NBACK, data).pipe(map((ok) => ok.ok));
    }

    continueAhead() {
        const decodedToken = this.authService.getDecodedToken();
        if (decodedToken.Role === Role.ADMIN) {
            if (!environment.production) console.log(this.data);

            this.router.navigate(["/dashboard/components"]);
            this.snackbarService.openInfoSnackbar("Task completed");
        } else {
            this.taskManager.next();
        }
    }

    reset() {
        this.currentLetter = "";
        this.nback = "";
        this.feedback = "";
        this.feedbackShown = false;
        this.scoreForSpecificTrial = 0;
    }

    resetData() {
        this.totalScore = 0;
    }

    startGameInFullScreen() {
        setFullScreen();
    }

    wait(time: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }
}
