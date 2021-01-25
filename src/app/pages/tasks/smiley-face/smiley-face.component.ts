import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { idIsEven, wait } from 'src/app/common/commonMethods';
import { Key, Role, UserResponse } from 'src/app/models/InternalDTOs';
import { SmileyFace } from 'src/app/models/TaskData';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { TimerService } from 'src/app/services/timer.service';
import { UploadDataService } from 'src/app/services/uploadData.service';
import { environment } from 'src/environments/environment';
import { BlockGenerator } from '../oddball/BlockGenerator';
declare function setFullScreen(): any;
import { SmileyFaceType, SmileyFaceBlock } from './BlockGenerator';

@Component({
  selector: 'app-smiley-face',
  templateUrl: './smiley-face.component.html',
  styleUrls: ['./smiley-face.component.scss']
})
export class SmileyFaceComponent implements OnInit {

  userID = "";

  // Default Experiment config
  showFeedbackAfterEveryTrial: boolean | number = true;
  maxResponseTime: number = 800;        // In milliseconds
  durationOfFeedback: number = 1750;    // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  durationFixationShown: number = 500;
  practiceTrials: number = 10;
  actualTrials: number = 100;

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
  sTimeout: any;
  feedbackShown: boolean = false;
  currentBlock: SmileyFaceBlock;
  currentBlockNum: number = 0;
  
  shortMouthRewardedMore: boolean = false;

  @HostListener('window:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.isResponseAllowed && this.isValidKey(event.key)) {
      this.isResponseAllowed = false;
      clearTimeout(this.sTimeout);
      const latestTrial = this.data[this.data.length];
      latestTrial.responseTime = this.timerService.stopTimerAndGetTime();
      latestTrial.submitted = this.timerService.getCurrentTimestamp();
      latestTrial.userAnswer = event.key === Key.Z ? UserResponse.SHORT : UserResponse.LONG;
      latestTrial.keyPressed = event.key === Key.Z ? Key.Z : Key.M;

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
    this.currentBlock = new SmileyFaceBlock(5, 5, 5, 5)
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
    this.currentBlock = new SmileyFaceBlock(50, 30, 50, 10);
    this.currentBlockNum++;
    this.resetData();
    this.proceedtoNextStep();
    await wait(2000);
    this.proceedtoNextStep();
    this.isPractice = false;
    this.showStimulus();
  }



  async showStimulus() {
    this.reset();
    this.showFixation = true;
    await wait(this.durationFixationShown);
    this.showFixation = false;
    this.isStimulus = true;
    this.smileyFaceType = SmileyFaceType.NONE;
    await wait(500);

    this.currentTrial += 1;
    this.generateStimulus();

    await wait(100);
    this.smileyFaceType = SmileyFaceType.NONE;

    this.isResponseAllowed = true;
    this.timerService.startTimer();
  }



  generateStimulus() {

    const nextTrial = this.currentBlock.getAndSetNextTrial();
    this.smileyFaceType = nextTrial.faceShown;

    this.data.push({
      actualAnswer: this.smileyFaceType === SmileyFaceType.SHORT ? 'Z' : 'M',
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
      experimentCode: this.taskManager.getExperimentCode()
    });
  }



  async showFeedback() {
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
        thisTrial.responseTime = this.maxResponseTime;
        this.scoreForSpecificTrial = 0;
        break;
      default:
        this.scoreForSpecificTrial = 0;
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
      } else {
        console.log(this.data);
        
        this.currentBlockNum = 0;
        this.proceedtoNextStep();
        await wait(2000);
        this.proceedtoNextStep();
      }
    } else {
      if (this.currentTrial < this.actualTrials) {
        this.continueGame();
      } else {
        console.log(this.data);
        
        this.proceedtoNextStep();
        await wait(2000);
        this.proceedtoNextStep();
        console.log(this.data);
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



  uploadResults() {
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
