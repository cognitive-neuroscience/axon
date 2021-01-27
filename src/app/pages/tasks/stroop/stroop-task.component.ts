import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UploadDataService } from 'src/app/services/uploadData.service';
import * as Set1 from './stimuli_1_1';
import * as Set2 from './stimuli_2_1';
import * as Set3 from './stimuli_3_1';
import * as Set4 from './stimuli_4_1';
import * as PracticeSet from './stimuli_practice';
import { TaskManagerService } from '../../../services/task-manager.service';
import { StroopTask, StroopTaskStimuli, TaskNames } from '../../../models/TaskData';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { Key, Role } from 'src/app/models/InternalDTOs';
import { TimerService } from '../../../services/timer.service';
import { UserResponse, Feedback } from '../../../models/InternalDTOs';
import { environment } from '../../../../environments/environment';
declare function setFullScreen(): any;

@Component({
  selector: 'app-stroop-task',
  templateUrl: './stroop-task.component.html',
  styleUrls: ['./stroop-task.component.scss']
})
export class StroopTaskComponent implements OnInit {

  // Default Experiment config
  userID: string;
  isScored: boolean | number = true;
  showFeedbackAfterEveryTrial: boolean | number = true;
  showScoreAfterEveryTrial: boolean | number = false;
  numberOfBreaks: number = 0;
  maxResponseTime: number = 2000;        // In milliseconds
  durationOfFeedback: number = 500;    // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  practiceTrials: number = environment.production ? 15 : 5;
  actualTrials: number = environment.production ? 60 : 10;

  step: number = 1;
  color: string = '';
  text: string = '';
  feedback: string = '';
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;
  isPractice: boolean = false;
  isStimulus: boolean = false;
  isBreak: boolean = false;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;
  data: StroopTask[] = [];
  set: number;
  showFixation: boolean = false;
  sTimeout: any;
  feedbackShown: boolean = false;

  @HostListener('window:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if(this.isValidKey(event.key) && this.isResponseAllowed) {
      this.isResponseAllowed = false;
      const lastElement = this.data[this.data.length - 1];
      lastElement.responseTime = this.timerService.stopTimerAndGetTime();
      lastElement.submitted = this.timerService.getCurrentTimestamp();
      switch (event.key) {
        case Key.NUMONE: lastElement.userAnswer = UserResponse.RED; break;
        case Key.NUMTWO: lastElement.userAnswer = UserResponse.BLUE; break;
        case Key.NUMTHREE: lastElement.userAnswer = UserResponse.GREEN; break;
        default: lastElement.userAnswer = UserResponse.INVALID; break;
      }
      clearTimeout(this.sTimeout);
      this.showFeedback();
    }
  }

  private isValidKey(key: string): boolean {
    if(!key) return false
    if(key === Key.NUMONE || key === Key.NUMTWO || key === Key.NUMTHREE) {
      return true
    } else {
      return false
    }
  }


  constructor(
    private router: Router,
    private uploadDataService: UploadDataService,
    private taskManager: TaskManagerService,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    private timerService: TimerService
  ) {
  }



  ngOnInit() {
    const decodedToken = this.authService.getDecodedToken()
    if(!this.taskManager.hasExperiment() && decodedToken.Role !== Role.ADMIN) {
      this.router.navigate(['/login/onlineparticipant'])
      this.snackbarService.openErrorSnackbar("Refresh has occurred")
    }
    this.set = Math.floor(Math.random() * 4) + 1;
    const jwt = this.authService.getDecodedToken()
    this.userID = jwt.UserID
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
    const setNum = this.isPractice ? 0 : this.set
    let selectedSet: StroopTaskStimuli;

    switch (setNum) {
      case 1:
        selectedSet = Set1
        break;
      case 2:
        selectedSet = Set2
        break;
      case 3:
        selectedSet = Set3
        break;
      case 4:
        selectedSet = Set4
        break;
      case 0:
        selectedSet = PracticeSet
        break;
    }

    this.color = selectedSet.set[this.currentTrial - 1].color
    this.text = selectedSet.set[this.currentTrial - 1].word

    this.data.push({
      userID: this.userID,
      trial: this.currentTrial,
      actualAnswer: (this.color.toUpperCase() === UserResponse.RED) ? UserResponse.RED : ((this.color.toUpperCase() === UserResponse.BLUE) ? UserResponse.BLUE : UserResponse.GREEN),
      userAnswer: UserResponse.NA,
      isCongruent: this.color === this.text ? true : false,
      responseTime: null,
      isCorrect: false,
      score: 0,
      set: this.set,
      submitted: this.timerService.getCurrentTimestamp(),
      isPractice: this.isPractice,
      experimentCode: this.taskManager.getExperimentCode()
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
        this.continueGame();
      } else {
        this.proceedtoNextStep();

        const decodedToken = this.authService.getDecodedToken()
        if(decodedToken.Role === Role.ADMIN) {
          this.proceedtoNextStep()
        } else {

          this.uploadResults(this.data).subscribe(ok => {
            if(ok) {
              this.proceedtoNextStep();
            } else {
              console.error("There was an error downloading results")
              this.taskManager.handleErr()
            }
          }, err => {
            console.error("There was an error downloading results")
            this.taskManager.handleErr()
          })

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



  uploadResults(data: StroopTask[]): Observable<boolean> {
    const experimentCode = this.taskManager.getExperimentCode()
    return this.uploadDataService.uploadData(experimentCode, TaskNames.STROOP, data).pipe(
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
    this.color = '';
    this.text = '';
    this.feedback = '';
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
