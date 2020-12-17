import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UploadDataService } from 'src/app/services/uploadData.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as practiceGrid1 from './grid.1.practice';
import * as grid1 from './grid.1';
import * as practiceGrid2 from './grid.2.practice';
import * as grid2 from './grid.2';
import { MatButton } from '@angular/material/button';
import { TrailMaking } from 'src/app/models/TaskData';
import { TimerService } from '../../../services/timer.service';
import { AuthService } from '../../../services/auth.service';
import { TaskManagerService } from '../../../services/task-manager.service';
import { Role } from 'src/app/models/InternalDTOs';
import { SnackbarService } from '../../../services/snackbar.service';

declare function setFullScreen(): any;

export enum TrialType {
  ALPHANUMERIC = "ALPHANUMERIC",
  NUMERIC = "NUMERIC"
}

export class GridConfig {
  correct: any[];
  grid: {value: any}[][]
}

@Component({
  selector: 'app-trail-making',
  templateUrl: './trail-making.component.html',
  styleUrls: ['./trail-making.component.scss']
})
export class TrailMakingComponent implements OnInit {
  userID: string = "";
  step: number = 1;
  isScored: number | boolean;
  showFeedbackAfterEveryTrial: number | boolean;
  showScoreAfterEveryTrial: number | boolean;
  flashIncorrectDuration: number = 500;
  numberOfBreaks: number;
  maxResponseTime: number;
  durationOfFeedback: number;
  interTrialDelay: number;
  practiceTrials: number;
  actualTrials: number;
  data: TrailMaking[] = [];
  clickNum: number = 0;
  sTimeout;
  // can be numbers or letters
  correctItems: (number | string)[] = [];
  answerKey: (number | string)[] = [];
  gridConfig: GridConfig

  constructor(
    private router: Router,
    private uploadDataService: UploadDataService,
    private renderer: Renderer2,
    private timerService: TimerService,
    private authService: AuthService,
    private taskManager: TaskManagerService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit() {
    const decodedToken = this.authService.getDecodedToken()
    if(!this.taskManager.hasExperiment() && decodedToken.Role !== Role.ADMIN) {
      this.router.navigate(['/login/mturk'])
      this.snackbarService.openErrorSnackbar("Refresh has occurred")
    }
    const jwt = this.authService.getDecodedToken()
    this.userID = jwt.UserID
  }

  proceedtoPreviousStep() {
    this.step -= 1;
  }

  proceedtoNextStep() {
    this.step += 1;
  }

  // sets the button color to green if it is correct and white otherwise
  getColor(val: number | string) {
    return this.correctItems.includes(val) ? 'green' : 'whitesmoke';
  }

  registerClick(button: MatButton, value: number | string) {

    // if answer has already been recorded as correct, we do nothing
    if (this.correctItems.includes(value)) return;

    this.correctItems.push(value);
    const currIndex = this.correctItems.length - 1;
    const isCorrect = this.correctItems[currIndex] === this.answerKey[currIndex];

    // record the click
    this.data.push({
      userID: this.userID,
      score: null,
      trial: ++this.clickNum,
      timeFromLastClick: this.timerService.stopTimerAndGetTime(),
      trialType: this.step >= 9 ? TrialType.ALPHANUMERIC : TrialType.NUMERIC,
      userAnswer: value.toString(),
      actualAnswer: this.answerKey[currIndex].toString(),
      isCorrect: isCorrect,
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

    this.changeColor(elRef, 'red');

    // case: elRef = button 2, val = 2
    // 1. user selects 2 (incorrect)
    // 2. user selects 1 immediately (correct)
    // 3. user selects 2 immediately (now correct)
    // in this case, we don't want the color to change back to white, we want to
    // keep it green so we need to check if the user happened to selected the correct
    // answer before the timeout ended
    setTimeout(() => {
      if(!this.correctItems.includes(val)) {
        this.changeColor(elRef, 'whitesmoke')
      }
    }, this.flashIncorrectDuration)
  }

  private changeColor(elRef: ElementRef, color: string) {
    this.renderer.setStyle(elRef.nativeElement, 'background-color', color);
  }

  private async roundComplete() {
    await this.wait(1000);
    this.timerService.clearTimer();
    this.correctItems = [];
    this.proceedtoNextStep();
  }

  async startPractice() {
    this.gridConfig = this.step >= 9 ? practiceGrid2.config : practiceGrid1.config;
    this.answerKey = this.gridConfig.correct;
    this.correctItems = [];
    this.clickNum = 0;
    this.data = [];
    this.startGameInFullScreen();
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
    this.timerService.startTimer();
  }

  async startActual() {
    this.gridConfig = this.step >= 9 ? grid2.config : grid1.config;
    this.answerKey = this.gridConfig.correct;
    this.correctItems = [];
    this.clickNum = 0;
    this.data = [];
    this.startGameInFullScreen();
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
    this.timerService.startTimer();
    // this.sTimeout = setTimeout(() => {
    //   this.proceedtoNextStep();
    //   this.snackbar.open('Timeout', '', { duration: 2000 });
    // }, 240000);
  }


  uploadResults() {
  }


  continueAhead() {
    this.router.navigate(['/dashboard']);
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
