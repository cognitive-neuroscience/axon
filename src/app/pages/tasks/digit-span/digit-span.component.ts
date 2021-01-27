import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UploadDataService } from 'src/app/services/uploadData.service';
declare function setFullScreen(): any;
import * as practiceSequence from './sequence.practice';
import * as actualSequence from './sequence';
import { DigitSpan, TaskNames } from 'src/app/models/TaskData';
import { AuthService } from 'src/app/services/auth.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { Feedback, Role, UserResponse } from 'src/app/models/InternalDTOs';
import { TimerService } from 'src/app/services/timer.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-digit-span',
  templateUrl: './digit-span.component.html',
  styleUrls: ['./digit-span.component.scss']
})
export class DigitSpanComponent implements OnInit {
  userID: string = "";

  // Default Experiment config
  isScored: boolean | number = true;
  showFeedbackAfterEveryTrial: boolean | number = true;
  showScoreAfterEveryTrial: boolean | number = false;
  numberOfBreaks: number = 0;
  maxResponseTime: number = 30000;        // 30 seconds
  durationOfFeedback: number = 1000;    // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  practiceTrials: number = 1;
  actualTrials: number = 1;
  delayToShowHelpMessage: number = 20000;
  durationHelpMessageShown: number = 4000;
  backwardMemoryMode: boolean = false;

  snackbarTimeout: number;
  responseTimeout: number;

  step: number = 1;
  digitShown: string = '';
  feedback: string = '';
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;
  isPractice: boolean = false;
  isStimulus: boolean = false;
  isKeypad: boolean = false;
  isFeedback: boolean = false;
  isBreak: boolean = false;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;

  sequence: number[][][];

  currentSequence: {
    level: number, // represents the difficulty (ranging from 0 to 7)
    set: number    // represents whether we're using the first or second set of that level
  } = {
    level: 0,
    set: 0
  }

  data: DigitSpan[] = [];
  showFixation: boolean = false;

  constructor(
    private router: Router,
    private uploadDataService: UploadDataService,
    private authService: AuthService,
    private taskManager: TaskManagerService,
    private snackbarService: SnackbarService,
    private timerService: TimerService
  ) { }



  ngOnInit() {
    const decodedToken = this.authService.getDecodedToken()
    if(!this.taskManager.hasExperiment() && decodedToken.Role !== Role.ADMIN) {
      this.router.navigate(['/login/onlineparticipant'])
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

  async startForwardMemoryPractice() {
    this.sequence = practiceSequence.config.forwardSequence;
    this.backwardMemoryMode = false;
    this.startPractice();
  }

  async startBackwardMemoryPractice() {
    this.sequence = practiceSequence.config.backwardSequence;
    this.backwardMemoryMode = true;
    this.startPractice();
  }


  private async startPractice() {
    this.startGameInFullScreen();
    this.resetData();
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
    this.isPractice = true;
    this.currentTrial = 0;
    this.showStimulus();
  }

  async startForwardMemoryActual() {
    this.sequence = actualSequence.config.forwardSequence;
    this.backwardMemoryMode = false;
    this.startActualGame();
  }

  async startBackwardMemoryActual() {
    this.sequence = actualSequence.config.backwardSequence;
    this.backwardMemoryMode = true;
    this.startActualGame();
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
    this.currentTrial++;

    await this.flashFixation();

    this.isStimulus = true;
    this.isKeypad = false;
    this.isFeedback = false;

    await this.generateStimulus();

    this.data.push({
      userID: this.userID,
      trial: this.currentTrial,
      submitted: this.timerService.getCurrentTimestamp(),
      isPractice: this.isPractice,
      experimentCode: this.taskManager.getExperimentCode(),
      userAnswer: UserResponse.NA,
      actualAnswer: this.getActualAnswer(),
      responseTime: 0,
      numberOfDigits: this.sequence[this.currentSequence.level][this.currentSequence.set].length,
      isCorrect: false,
      score: 0,
      isForwardMemoryMode: this.backwardMemoryMode ? false : true
    });

    this.timerService.startTimer();
    this.isStimulus = false;
    this.isKeypad = true;
    this.isResponseAllowed = true;

    this.showHelpMessage("Please enter your response", this.delayToShowHelpMessage, this.durationHelpMessageShown);

    this.responseTimeout = setTimeout(() => {
      const message = "Please do your best to provide your answer in the time allotted for the next trial.";
      this.snackbarService.openInfoSnackbar(message, undefined, this.durationHelpMessageShown);
      this.showFeedback();
    }, this.maxResponseTime);
  }

  private showHelpMessage(helpMessage: string, delay: number, duration: number) {
    this.snackbarTimeout = setTimeout(() => {
      this.snackbarService.openInfoSnackbar(helpMessage, undefined, duration, 'center');
    }, delay);
  }

  private getActualAnswer(): string {
    const thisSequence = this.sequence[this.currentSequence.level][this.currentSequence.set];
    let answer = this.arrayToPaddedString(thisSequence);
    if(this.backwardMemoryMode) answer = answer.split("").reverse().join("");
    return answer;
  }

  private async flashFixation() {
    this.showFixation = true;
    await this.wait(500);
    this.showFixation = false;
    await this.wait(200);
  }


  async generateStimulus() {
    const sequenceToShow: number[] = this.sequence[this.currentSequence.level][this.currentSequence.set]
    for (const num of sequenceToShow) {
      this.digitShown = num.toString();
      await this.wait(1000);
      this.digitShown = "";
      await this.wait(300);
    };
  }

  onNumpadSubmit($event: string) {
    clearTimeout(this.snackbarTimeout);
    clearTimeout(this.responseTimeout);
    this.snackbarService.clearSnackbar();
    const thisTrial = this.data[this.data.length - 1];

    if($event !== UserResponse.NA) {
      thisTrial.userAnswer = this.padString($event);
    }
    
    thisTrial.submitted = this.timerService.getCurrentTimestamp();
    thisTrial.responseTime = this.timerService.stopTimerAndGetTime();
    this.showFeedback();
  }

  private arrayToPaddedString(arr: number[]): string {
    let str = "";
    arr.forEach(x => str = `${str}${x} `);
    return str.slice(0, str.length - 1);
  }

  // adds spaces in between the letters of a string
  private padString(strToPad: string): string {
    let x = "";
    for(const letter of strToPad) {
      x = `${x}${letter} `;
    }
    return x.slice(0, x.length - 1);
  }


  async showFeedback() {
    this.isStimulus = false;
    this.isKeypad = false;
    this.isFeedback = true;
    this.isResponseAllowed = false;

    const thisTrial = this.data[this.data.length - 1];

    const actualAnswer = thisTrial.actualAnswer;
    const userAnswer = thisTrial.userAnswer;

    switch (userAnswer) {
      case actualAnswer:
        this.feedback = Feedback.CORRECT;
        thisTrial.isCorrect = true;
        thisTrial.score = 10;
        this.scoreForSpecificTrial = 10;
        this.totalScore += 10;
        this.updateCurrentSequence(true);
        break;
      case UserResponse.NA:
        this.feedback = Feedback.NORESPONSE;
        thisTrial.responseTime = thisTrial.responseTime == 0 ? this.maxResponseTime : thisTrial.responseTime;
        this.scoreForSpecificTrial = 0;
        this.updateCurrentSequence(false);
        break;
      default:
        this.feedback = Feedback.INCORRECT;
        this.scoreForSpecificTrial = 0;
        this.updateCurrentSequence(false);
        break;
    }

    // show feedback either if it is a practice trial, or if the feedback is telling the user
    // they are too slow. Don't show for other feedback during actual game
    if (this.isPractice || (this.showFeedbackAfterEveryTrial && this.feedback === Feedback.NORESPONSE)) {
      await this.wait(this.durationOfFeedback);
    }

    this.decideToContinue();
  }

  private updateCurrentSequence(isCorrect: boolean) {
    if(isCorrect) {
      this.currentSequence.level++;
      this.currentSequence.set = 0;
    } else {
      this.currentSequence.set++;
    }
  }

  private canContinueGame(): boolean {
    if(this.currentSequence.level >= 7) {
      // 6 possible levels, meaning the participant has successfully completed all the trials
      return false;
    } else if(this.currentSequence.set >= 2) {
      // the participant has gotten 2 wrong in the same level, meaning they have to move on
      return false;
    }
    return true;
  }



  async decideToContinue() {
    // only 1 practice trial
    if (this.isPractice) {
      this.proceedtoNextStep();
      await this.wait(2000);
      this.proceedtoNextStep();
    } else {
      if (this.canContinueGame()) {
        this.continueGame();
      } else {

        this.proceedtoNextStep();

        if(this.step >= 17) {
          const decodedToken = this.authService.getDecodedToken()

          if(decodedToken.Role === Role.ADMIN) {
            this.proceedtoNextStep();
          } else {

            this.uploadResults(this.data).pipe().subscribe(ok => {
              if(ok) {
                this.proceedtoNextStep();
              } else {
                this.taskManager.handleErr();
              }
            }, err => {
              this.taskManager.handleErr();
            })

          }
        } else {
          await this.wait(2000)
          this.proceedtoNextStep();
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



  uploadResults(data: DigitSpan[]): Observable<boolean> {
    const experimentCode = this.taskManager.getExperimentCode()
    return this.uploadDataService.uploadData(experimentCode, TaskNames.DIGITSPAN, data).pipe(
      map(ok => ok.ok)
    )
  }



  continueAhead() {
    const decodedToken = this.authService.getDecodedToken()
    if(decodedToken.Role === Role.ADMIN) {
      if(!environment.production) console.log(this.data)
      
      this.router.navigate(['/dashboard/tasks'])
      this.snackbarService.openInfoSnackbar("Task completed")
    } else {
      this.taskManager.nextExperiment()
    }
  }



  reset() {
    this.feedback = '';
    this.timerService.clearTimer()
    this.digitShown = '';
    this.scoreForSpecificTrial = 0;
  }



  resetData() {
    this.totalScore = 0;
    this.currentTrial = 0;
    this.currentSequence.level = 0;
    this.currentSequence.set = 0;
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
