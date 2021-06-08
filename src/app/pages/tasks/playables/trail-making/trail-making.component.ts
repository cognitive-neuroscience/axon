import { Component, OnInit, Renderer2, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { UploadDataService } from "src/app/services/uploadData.service";
import * as practiceGrid1 from "./grid.1.practice";
import * as grid1 from "./grid.1";
import * as practiceGrid2 from "./grid.2.practice";
import * as grid2 from "./grid.2";
import { MatButton } from "@angular/material/button";
import { TrailMaking } from "src/app/models/TaskData";
import { TimerService } from "../../../../services/timer.service";
import { AuthService } from "../../../../services/auth.service";
import { TaskManagerService } from "../../../../services/task-manager.service";
import { Role } from "src/app/models/enums";
import { SnackbarService } from "../../../../services/snackbar.service";
import { Observable } from "rxjs";
import { TaskNames } from "../../../../models/TaskData";
import { map, take } from "rxjs/operators";
import { environment } from "src/environments/environment";

declare function setFullScreen(): any;

export enum TrialType {
    ALPHANUMERIC = "ALPHANUMERIC",
    NUMERIC = "NUMERIC",
}

export class GridConfig {
    correct: any[];
    grid: { value: any }[][];
}

@Component({
    selector: "app-trail-making",
    templateUrl: "./trail-making.component.html",
    styleUrls: ["./trail-making.component.scss"],
})
export class TrailMakingComponent implements OnInit {
    step: number = 1;
    isScored: number | boolean;
    showFeedbackAfterEveryTrial: number | boolean;
    showScoreAfterEveryTrial: number | boolean;
    flashIncorrectDuration: number = 500;
    numberOfBreaks: number;
    // 4 minute timer
    timeToComplete: number = 240000;
    maxResponseTime: number;
    durationOfFeedback: number;
    interTrialDelay: number;
    practiceTrials: number;
    actualTrials: number;
    data: TrailMaking[] = [];
    clickNum: number = 0;
    sTimeout;
    isPractice: boolean = true;
    // can be numbers or letters
    correctItems: (number | string)[] = [];
    answerKey: (number | string)[] = [];
    gridConfig: GridConfig;

    constructor(
        private router: Router,
        private uploadDataService: UploadDataService,
        private renderer: Renderer2,
        private timerService: TimerService,
        private authService: AuthService,
        private taskManager: TaskManagerService,
        private snackbarService: SnackbarService
    ) {}

    ngOnInit() {}

    proceedtoPreviousStep() {
        this.step -= 1;
    }

    proceedtoNextStep() {
        this.step += 1;
    }

    // sets the button color to green if it is correct and white otherwise
    getColor(val: number | string) {
        return this.correctItems.includes(val) ? "green" : "whitesmoke";
    }

    registerClick(button: MatButton, value: number | string) {
        // if answer has already been recorded as correct, we do nothing
        if (this.correctItems.includes(value)) return;

        this.correctItems.push(value);
        const currIndex = this.correctItems.length - 1;
        const isCorrect = this.correctItems[currIndex] === this.answerKey[currIndex];

        // record the click if actual game
        this.data.push({
            userID: this.authService.getDecodedToken().UserID,
            score: null,
            trial: ++this.clickNum,
            timeFromLastClick: this.timerService.stopTimerAndGetTime(),
            trialType: this.step >= 9 ? TrialType.ALPHANUMERIC : TrialType.NUMERIC,
            userAnswer: value.toString(),
            actualAnswer: this.answerKey[currIndex].toString(),
            isCorrect: isCorrect,
            submitted: this.timerService.getCurrentTimestamp(),
            isPractice: this.isPractice,
            studyCode: this.taskManager.getStudyCode(),
        });

        this.timerService.clearTimer();
        this.timerService.startTimer();

        // selected answer is incorrect
        if (!isCorrect) {
            this.correctItems.pop();
            this.flashIncorrectColor(button._elementRef, value);
        }

        // if we have filled up all the correct Items, complete the round and move on
        if (this.correctItems.length === this.answerKey.length) this.roundComplete();
    }

    private flashIncorrectColor(elRef: ElementRef, val: number | string) {
        this.changeColor(elRef, "red");

        // case: elRef = button 2, val = 2
        // 1. user selects 2 (incorrect)
        // 2. user selects 1 immediately (correct)
        // 3. user selects 2 immediately (now correct)
        // in this case, we don't want the color to change back to white, we want to
        // keep it green so we need to check if the user happened to selected the correct
        // answer before the timeout ended
        setTimeout(() => {
            if (!this.correctItems.includes(val)) {
                this.changeColor(elRef, "whitesmoke");
            }
        }, this.flashIncorrectDuration);
    }

    private changeColor(elRef: ElementRef, color: string) {
        this.renderer.setStyle(elRef.nativeElement, "background-color", color);
    }

    private async roundComplete() {
        clearTimeout(this.sTimeout);
        this.proceedtoNextStep();

        const decodedToken = this.authService.getDecodedToken();
        if (decodedToken.Role === Role.ADMIN) {
            this.proceedtoNextStep();
            return;
        }

        // if the role is admin, do not try and upload results
        if (this.step >= 17) {
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
        } else {
            await this.wait(2000);
            this.timerService.clearTimer();
            this.correctItems = [];
            this.proceedtoNextStep();
        }
    }

    async startPractice() {
        this.isPractice = true;
        this.gridConfig = this.step >= 9 ? practiceGrid2.config : practiceGrid1.config;
        this.answerKey = this.gridConfig.correct;
        this.correctItems = [];
        this.clickNum = 0;
        this.startGameInFullScreen();
        this.proceedtoNextStep();
        await this.wait(2000);
        this.proceedtoNextStep();
        this.timerService.startTimer();
    }

    async startActual() {
        this.isPractice = false;
        this.gridConfig = this.step >= 9 ? grid2.config : grid1.config;
        this.answerKey = this.gridConfig.correct;
        this.correctItems = [];
        this.clickNum = 0;
        this.startGameInFullScreen();
        this.proceedtoNextStep();
        await this.wait(2000);
        this.proceedtoNextStep();
        this.timerService.startTimer();

        this.sTimeout = setTimeout(() => {
            this.snackbarService.openInfoSnackbar("Time is up!");
            this.roundComplete();
        }, this.timeToComplete);
    }

    uploadResults(data: TrailMaking[]): Observable<boolean> {
        const studyCode = this.taskManager.getStudyCode();
        return this.uploadDataService.uploadData(studyCode, TaskNames.TRAILMAKING, data).pipe(map((ok) => ok.ok));
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
