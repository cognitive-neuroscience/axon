import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Matrix } from './matrix';
import { UploadDataService } from 'src/app/services/uploadData.service';
import { Color, Key, Role, UserResponse, Feedback } from '../../../models/InternalDTOs';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { TaskManagerService } from '../../../services/task-manager.service';
import { TaskSwitching } from '../../../models/TaskData';
import { TimerService } from '../../../services/timer.service';
declare function setFullScreen(): any;

@Component({
  selector: 'app-task-switching',
  templateUrl: './task-switching.component.html',
  styleUrls: ['./task-switching.component.scss']
})
export class TaskSwitchingComponent implements OnInit {
  userID: string;
  isScored: boolean = false;
  showFeedbackAfterEveryTrial: boolean = true;
  showScoreAfterEveryTrial: boolean = false;
  numberOfBreaks: number = 0;
  maxResponseTime: number = 4000;
  durationOfFeedback: number = 500;
  interTrialDelay: number = 1000;
  practiceTrials: number;
  actualTrials: number = 5;

  step: number = 1;
  // color of digit being displayed
  color: string = 'transparent';
  // digit being displayed
  number: number = 0;
  // feedback to participant after the trial
  feedback: string = '';
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;
  isPractice: boolean = false;
  // what practice phase we are currently at
  currentPracticeRound: {
    phase: number,
    round: number // multiple rounds for each phase (each repeat is +1 round)
  } = {
    phase: 0,
    round: 0
  }
  // config for setting up practice rounds
  practiceRoundConfig: {
    [key: number]: {
      numTrials: number, 
      showFeedback: boolean, 
      responseTime: number, // in milliseconds
      repeat: {
        canRepeat: boolean, 
        numRepeatsAllowed: number,
        thresholdForRepeat?: number
      }
    }
  } = {
    1: {
      numTrials: 5,
      showFeedback: true,
      responseTime: 10000,
      repeat: {
        canRepeat: false,
        numRepeatsAllowed: 0
      }
    },
    2: {
      numTrials: 5,
      showFeedback: true,
      responseTime: 4000,
      repeat: {
        canRepeat: true,
        numRepeatsAllowed: 1,
        thresholdForRepeat: 0.8,
      }
    },
    3: {
      numTrials: 5,
      showFeedback: false,
      responseTime: 4000,
      repeat: {
        canRepeat: false,
        numRepeatsAllowed: 0
      }
    }
  }

  isStimulus: boolean = false;
  isBreak: boolean = false;
  fRepeat = false;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;
  sTimeout: any;
  data: TaskSwitching[] = [];
  showFixation: boolean = false;
  feedbackShown: boolean = false;
  matrix: Matrix;

  oddEvenColor = Color.BLUE;
  ltGtColor = Color.ORANGE;

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.isResponseAllowed && this.isValidKey(event.key)) {
      // if we have a response before timeout, we need to make sure this is cleared
      clearTimeout(this.sTimeout)

      this.isResponseAllowed = false;
      let userAnswer: UserResponse;
      this.data[this.data.length - 1].responseTime = this.timerService.stopTimerAndGetTime();

      // mark down user response
      if(this.matrix.colors[this.currentTrial - 1] === this.oddEvenColor) {
        userAnswer = event.key === Key.ARROWLEFT ? UserResponse.ODD : UserResponse.EVEN
      } else {
        userAnswer = event.key === Key.ARROWLEFT ? UserResponse.LESSER : UserResponse.GREATER
      }

      this.data[this.data.length - 1].userAnswer = userAnswer;

      this.showFeedback();
    }
  }

  private isValidKey(key: string): boolean {
    if(key === Key.ARROWLEFT || key === Key.ARROWRIGHT) return true;
    return false;
  }

  constructor(
    private router: Router,
    private uploadDataService: UploadDataService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private taskManager: TaskManagerService,
    private timerService: TimerService
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

  proceedtoPreviousStep(steps = 1) {
    this.step -= steps;
  }

  proceedtoNextStep(steps = 1) {
    this.step += steps;
  }

  async startPractice() {

    this.applyPracticeTrialConfigs()

    this.matrix = new Matrix(this.practiceTrials, 50, Color.BLUE, Color.ORANGE);
    this.startGameInFullScreen();
    this.resetData();
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
    this.isPractice = true;
    this.currentTrial = 0;
    this.showStimulus();
  }

  // looks at the practice trial config and applies the number of practice trials, feedback shown, as well as
  // whether the phase needs to be repeated or not
  private applyPracticeTrialConfigs() {

    if(this.currentPracticeRound.round == 0 || !this.shouldRepeatPracticePhase()) {
      // if we are at the first round of the phase, we don't worry about repeating
      // we should not go to the next phase if we need to repeat
      this.currentPracticeRound.phase++;
      this.currentPracticeRound.round = 0;
    }

    const phase = this.currentPracticeRound.phase;
    this.practiceTrials = this.practiceRoundConfig[phase].numTrials;
    this.maxResponseTime = this.practiceRoundConfig[phase].responseTime;
    this.showFeedbackAfterEveryTrial = this.practiceRoundConfig[phase].showFeedback;
    this.currentPracticeRound.round++;
  }

  public shouldRepeatPracticePhase(): boolean {
    const phase = this.currentPracticeRound.phase;
    const round = this.currentPracticeRound.round;
    const repeatConfig = this.practiceRoundConfig[phase].repeat;
    const threshold = repeatConfig.thresholdForRepeat ? repeatConfig.thresholdForRepeat : 1.01

    // repeat if we canRepeate = true, we haven't reached our max repeat limit, 
    // and the participant did worse than the given threshold
    if( repeatConfig.canRepeat && 
        round <= repeatConfig.numRepeatsAllowed && 
        this.getPercentageCorrect() < threshold
     ) {
      return true;
    }
    return false;
  }

  private getPercentageCorrect(): number {
    // divide by 0 guard
    if(this.practiceTrials == 0) return 0;
    return (this.totalScore / 10) / this.practiceTrials;
  }

  async startActualGame() {

    this.applyActualGameConfigs();

    this.matrix = new Matrix(this.actualTrials, 50, Color.BLUE, Color.ORANGE);
    this.resetData();
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
    this.showStimulus();
  }

  private applyActualGameConfigs() {
    this.isPractice = false;
    this.showFeedbackAfterEveryTrial = false;
    this.maxResponseTime = 4000;
    this.showScoreAfterEveryTrial = false;
    this.currentTrial = 0;
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

    // Give participant max time to respond to stimuli
    this.sTimeout = setTimeout(() => {
      if (!this.feedbackShown) {
        this.showFeedback();
      }
    }, this.maxResponseTime);
  }

  generateStimulus() {
    const color = this.matrix.colors[this.currentTrial - 1];
    const digit = this.matrix.digits[this.currentTrial - 1];
    let answer: UserResponse;
    if (color === this.oddEvenColor) {
      if (digit % 2 === 0) {
        answer = UserResponse.EVEN;
      } else {
        answer = UserResponse.ODD;
      }
    } else {
      if (digit > 5) {
        answer = UserResponse.GREATER;
      } else {
        answer = UserResponse.LESSER;
      }
    }
    this.color = color;
    this.number = digit;
    this.data.push({
      trial: this.currentTrial,
      userID: this.userID,
      color: this.color,
      digit: digit,
      actualAnswer: answer,
      userAnswer: UserResponse.NA,
      responseTime: 0,
      isCorrect: false,
      score: 0,
    });
  }

  async showFeedback() {
    this.feedbackShown = true;
    this.isStimulus = false;
    this.isResponseAllowed = false;

    const currentDataObj = this.data[this.data.length - 1];

    switch (currentDataObj.userAnswer) {
      case currentDataObj.actualAnswer:   // correct
        this.feedback = Feedback.CORRECT;
        currentDataObj.isCorrect = true;
        currentDataObj.score = 10;
        this.scoreForSpecificTrial = 10;
        this.totalScore += 10;
        break;
      case UserResponse.NA:               // too slow
        this.feedback = Feedback.TOOSLOW;
        currentDataObj.responseTime = this.maxResponseTime;
        break;
      default:                            // incorrect
        this.feedback = Feedback.INCORRECT;
        this.scoreForSpecificTrial = 0;
        break;
    }

    // we want to show 'Too slow' every time
    if (this.feedback === Feedback.TOOSLOW || this.showFeedbackAfterEveryTrial) {
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
        await this.wait(2000);
        this.proceedtoNextStep();
        console.log(this.data);
        this.uploadResults();
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

  uploadResults() {
    if (this.data.length > 0) {
      let d = JSON.parse(JSON.stringify(this.data));
      // this.dataService.uploadData('ts', d);
    }
  }

  continueAhead() {
    const decodedToken = this.authService.getDecodedToken()
    if(decodedToken.Role === Role.ADMIN) {
      this.router.navigate(['/dashboard/tasks'])
      this.snackbarService.openInfoSnackbar("Task completed")
    } else {
      this.taskManager.nextExperiment()
    }
  }

  reset() {
    this.number = 0;
    this.color = Color.TRANSPARENT;
    this.feedback = '';
    this.feedbackShown = false;
    this.scoreForSpecificTrial = 0;
  }

  resetData() {
    this.data = [];
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
