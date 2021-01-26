import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { idIsEven, wait } from 'src/app/common/commonMethods';
import { Feedback, Key, Role, UserResponse } from 'src/app/models/InternalDTOs';
import { SmileyFace, TaskNames } from 'src/app/models/TaskData';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { TimerService } from 'src/app/services/timer.service';
import { UploadDataService } from 'src/app/services/uploadData.service';
import { environment } from 'src/environments/environment';

declare function setFullScreen(): any;
import { SmileyFaceType, SmileyFaceBlock } from './BlockGenerator';

@Component({
  selector: 'app-smiley-face',
  templateUrl: './smiley-face.component.html',
  styleUrls: ['./smiley-face.component.scss']
})
export class SmileyFaceComponent implements OnInit {

  userID = "";
  countdownDisplayValue: number = 10;
  // Default Experiment config
  showFeedbackAfterEveryTrial: boolean | number = true;
  maxResponseTime: number = 3000;        // In milliseconds
  durationOfFeedback: number = 1000;    // In milliseconds
  interTrialDelay: number = 500;       // In milliseconds
  durationFixationShown: number = 500;
  durationStimulusShown: number = 100;
  practiceTrials: number = environment.production ? 10 : 4;
  actualTrials: number = environment.production ? 100: 4;
  rewardedMoreNum: number = environment.production ? 30 : 2;
  rewardedLessNum: number = environment.production ? 10 : 1;

  step: number = 1;
  smileyFaceType: string = SmileyFaceType.NONE;
  feedback: string = '';
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;
  isPractice: boolean = false;
  isStimulus: boolean = false;
  isBreak: boolean = false;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;
  data: SmileyFace[] = [];
  showFixation: boolean = false;
  
  // global timers
  countdownTimer: number;
  sTimeout: number;


  feedbackShown: boolean = false;
  currentBlock: SmileyFaceBlock;
  currentBlockNum: number = 0;
  
  shortMouthRewardedMore: boolean = false;


  @HostListener('window:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.isResponseAllowed && this.isValidKey(event.key)) {
      this.isResponseAllowed = false;
      clearTimeout(this.sTimeout);
      const thisTrial = this.data[this.data.length - 1];
      thisTrial.responseTime = this.timerService.stopTimerAndGetTime();
      thisTrial.submitted = this.timerService.getCurrentTimestamp();
      thisTrial.userAnswer = event.key === Key.Z ? UserResponse.SHORT : UserResponse.LONG;
      thisTrial.keyPressed = event.key === Key.Z ? Key.Z : Key.M;

      this.showFeedback();
    }
  }

  private isValidKey(key: string): boolean {
    if(key === Key.Z || key === Key.M) return true;
    return false;
  }



  constructor(
    private router: Router,
    private uploadDataService: UploadDataService,
    private authService: AuthService,
    private taskManager: TaskManagerService,
    private snackbarService: SnackbarService,
    private timerService: TimerService
  ) { }



  ngOnInit() {
    const decodedToken = this.authService.getDecodedToken();
    if(!this.taskManager.hasExperiment() && decodedToken.Role !== Role.ADMIN) {;
      this.router.navigate(['/login/mturk']);
      this.snackbarService.openErrorSnackbar("Refresh has occurred");
    };
    const jwt = this.authService.getDecodedToken();
    this.userID = jwt.UserID;

    this.shortMouthRewardedMore = idIsEven(this.userID);
  }



  proceedtoPreviousStep() {
    this.step -= 1;
  }



  proceedtoNextStep() {
    this.step += 1;
  }



  async startPractice() {
    const numEachTrial = this.practiceTrials / 2;
    // reward all correct answers in the practice
    this.currentBlock = new SmileyFaceBlock(numEachTrial, numEachTrial, numEachTrial, numEachTrial);
    this.currentBlockNum++;
    this.startGameInFullScreen();
    this.resetData();
    this.proceedtoNextStep();
    await wait(2000);
    this.proceedtoNextStep();
    this.isPractice = true;
    this.showStimulus();
  }



  async startActualGame() {
    const numEachTrial = this.actualTrials / 2;
    // counterbalanced
    this.currentBlock = this.shortMouthRewardedMore ? 
      new SmileyFaceBlock(numEachTrial, this.rewardedMoreNum, numEachTrial, this.rewardedLessNum) :
      new SmileyFaceBlock(numEachTrial, this.rewardedLessNum, numEachTrial, this.rewardedMoreNum);

    this.currentBlockNum++;
    this.resetData();
    this.proceedtoNextStep();
    await wait(2000);
    this.isPractice = false;
    this.startCountDownTimer();
  }

  startCountDownTimer() {
    this.startGameInFullScreen();
    this.proceedtoNextStep();
    this.countdownDisplayValue = 10;
    this.countdownTimer = setInterval(() => {
      this.countdownDisplayValue -= 1;
      if (this.countdownDisplayValue === 0) {
        clearInterval(this.countdownTimer);
        this.proceedtoNextStep();
        this.showStimulus();
      }
    }, 1000);
  }



  async showStimulus() {
    this.reset();
    this.currentTrial += 1;
    this.showFixation = true;
    await wait(this.durationFixationShown);
    this.showFixation = false;

    this.isStimulus = true;
    await wait(500);
    
    this.generateStimulus();

    this.timerService.startTimer();
    this.isResponseAllowed = true;
    await wait(this.durationStimulusShown);
    this.smileyFaceType = SmileyFaceType.NONE;


    // This is the delay between showing the stimulus and showing the feedback
    this.sTimeout = setTimeout(() => {
      clearTimeout(this.sTimeout)
      this.showFeedback();
      return;
    }, this.maxResponseTime);
  }



  generateStimulus() {

    const nextTrial = this.currentBlock.getAndSetNextTrial();
    this.smileyFaceType = nextTrial.faceShown;

    this.data.push({
      actualAnswer: this.smileyFaceType,
      userAnswer: UserResponse.NA,
      responseTime: 0,
      isCorrect: false,
      score: 0,
      block: this.currentBlockNum,
      stimulus: nextTrial.faceShown,
      keyPressed: UserResponse.NA,
      rewarded: false,
      trial: this.currentTrial,
      userID: this.userID,
      submitted: this.timerService.getCurrentTimestamp(),
      isPractice: this.isPractice,
      experimentCode: this.taskManager.getExperimentCode(),
      isRescheduledReward: nextTrial.isRescheduledReward
    });
  }



  async showFeedback() {
    clearTimeout(this.sTimeout)
    this.feedbackShown = true;
    this.isStimulus = false;
    this.isResponseAllowed = false;

    let thisTrial = this.data[this.data.length - 1];

    const userAnswer = thisTrial.userAnswer;
    const actualAnswer = thisTrial.actualAnswer;

    switch (userAnswer) {
      case actualAnswer:
        thisTrial.isCorrect = true;
        // only give feedback for the specific trials
        if(this.currentBlock.getCurrentTrial().isRewarded) {
          thisTrial.score = 50;
          this.scoreForSpecificTrial = 50;
          this.totalScore += 50;
          this.feedback = "+50";
          thisTrial.rewarded = true;
        }
        break;
      case UserResponse.NA:
        this.feedback = Feedback.TOOSLOW;
        this.currentBlock.postponeReward();
        thisTrial.responseTime = this.maxResponseTime;
        this.scoreForSpecificTrial = 0;
        break;
      default:
        this.scoreForSpecificTrial = 0;
        this.currentBlock.postponeReward();
        break;
    }

    if (this.feedback !== "") {
      await wait(this.durationOfFeedback);
    }
    this.decideToContinue();
  }



  async decideToContinue() {
    if (this.isPractice) {
      if (this.currentTrial < this.practiceTrials) {
        this.continueGame();
        return;
      } else {
        console.log(this.data);
        
        this.currentBlockNum = 0;
        this.proceedtoNextStep();
        await wait(2000);
        this.proceedtoNextStep();
        return;
      }
    } else {
      if (this.currentTrial < this.actualTrials) {
        this.continueGame();
        return;
      } else {
        console.log(this.data);
        this.proceedtoNextStep();

        if(this.currentBlockNum < 3) {
          this.takeBreak();
          return;
        } else {
          const decodedToken = this.authService.getDecodedToken()

          if(decodedToken.Role === Role.ADMIN) {
            this.proceedtoNextStep();
            return;
          } else {
  
            this.uploadResults(this.data).pipe(take(1)).subscribe(ok => {
              if(ok) {
                this.proceedtoNextStep();
                return;
              } else {
                console.error("There was an error downloading results")
                this.taskManager.handleErr();
                return;
              }
            }, err => {
              console.error("There was an error downloading results")
              this.taskManager.handleErr();
              return;
            })

          }
        }
      }
    }
  }

  async takeBreak() {
    await wait(2000);
    this.isBreak = true;
  }



  resume() {
    this.reset();
    this.isBreak = false;
    this.startActualGame();
  }



  async continueGame() {
    this.reset();
    await wait(this.interTrialDelay);
    this.showStimulus();
  }




  uploadResults(data: SmileyFace[]): Observable<boolean> {
    const experimentCode = this.taskManager.getExperimentCode()
    return this.uploadDataService.uploadData(experimentCode, TaskNames.SMILEYFACE, data).pipe(
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
    this.smileyFaceType = SmileyFaceType.NONE;
    this.feedback = '';
    this.feedbackShown = false;
    this.scoreForSpecificTrial = 0;
  }



  resetData() {
    this.currentTrial = 0;
    this.totalScore = 0;
  }



  startGameInFullScreen() {
    setFullScreen();
  }
}
