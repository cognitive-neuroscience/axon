import { HttpClient } from '@angular/common/http';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { getRandomNumber, idIsEven } from 'src/app/common/commonMethods';
import { Feedback, JitteredInterval, Key, Role, UserResponse } from 'src/app/models/InternalDTOs';
import { Oddball, TaskNames } from 'src/app/models/TaskData';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { TimerService } from 'src/app/services/timer.service';
import { UploadDataService } from 'src/app/services/uploadData.service';
import { environment } from 'src/environments/environment';
import { OddballTrial, BlockGenerator } from './BlockGenerator';
declare function setFullScreen(): any;

@Component({
  selector: 'app-oddball',
  templateUrl: './oddball.component.html',
  styleUrls: ['./oddball.component.scss']
})
export class OddballComponent implements OnInit {
  // Default Experiment config
  isScored: boolean | number = true;
  showFeedbackAfterEveryTrial: boolean | number = true;
  showScoreAfterEveryTrial: boolean | number = true;
  maxResponseTime: number = 2000;        // In milliseconds
  durationOfFeedback: number = 500;    // In milliseconds
  interTrialDelay: number = 200;       // In milliseconds
  durationFixationPresented: JitteredInterval = environment.production ? { lowerbound: 1000, upperbound: 2000 } : { lowerbound: 100, upperbound: 500 }
  durationStimulusPresented: number = 450;
  practiceTrials: number = environment.production ? 10 : 2;
  actualTrials: number = environment.production ? 60 : 5;

  studyLoaded: boolean = false;

  step: number = 1;
  block: number = 0;
  stimulusShown: string | ArrayBuffer = null;
  feedback: string = '';
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;
  isPractice: boolean = false;
  isStimulus: boolean = false;
  isBreak: boolean = false;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;

  breakTimeDisplayValue: number = 0;
  breakDuration: number = 31;

  trials: OddballTrial[];
  currentTrialConfig: OddballTrial;
  novelStimuliUsed: string[] = [];
  includeNovelStimuli: boolean = false;

  targetResponse: Key;
  targetImage: 'square.png' | 'triangle.png';

  data: Oddball[] = [];

  showFixation: boolean = false;

  // timers
  responseTimeout: number;
  stimulusShownTimeout: number;
  breakTimer: number;

  feedbackShown: boolean = false;

  @HostListener('window:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.isResponseAllowed && this.isValidKey(event.key)) {
      clearTimeout(this.responseTimeout);
      clearTimeout(this.stimulusShownTimeout)
      this.isResponseAllowed = false;
      const thisTrial = this.data[this.data.length - 1];
      
      thisTrial.userAnswer = event.key;
      thisTrial.responseTime = this.timerService.stopTimerAndGetTime();

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
    private timerService: TimerService,
    private http: HttpClient,
    private loader: LoaderService,
  ) { }

  ngOnInit() {

    this.loader.showLoader()

    // call initialize once to preload images
    BlockGenerator.initialize(this.http).subscribe(data => {
      this.loader.hideLoader()
      this.studyLoaded = true;
    }, err => {
      this.taskManager.handleErr();
    })

    this.targetResponse = idIsEven(this.authService.getDecodedToken().UserID) ? Key.M : Key.Z;
    this.targetImage = 'triangle.png';
  }



  proceedtoPreviousStep() {
    this.step -= 1;
  }



  proceedtoNextStep() {
    this.step += 1;
  }



  async startPractice() {
    this.trials = new BlockGenerator(this.targetImage, 2, 0, 10).trials;

    this.block = 1;

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
    // restart block from 0 after practice
    if(this.isPractice) this.block = 0;

    // note - novel stimuli is constantly updated as we are sending a reference to it to the block generator
    this.trials = this.includeNovelStimuli ? new BlockGenerator(this.targetImage, 6, 6, 60, this.novelStimuliUsed).trials : new BlockGenerator(this.targetImage, 12, 0, 60).trials;
    this.block++;

    this.resetData();
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
    // show the get ready slide
    await this.wait(2000);
    this.proceedtoNextStep();
    this.isPractice = false;
    this.currentTrial = 0;
    this.showStimulus();
  }






  async showStimulus() {
    this.currentTrial += 1;
    this.reset();
    this.generateStimulus();
    this.showFixation = true;
    await this.wait( getRandomNumber(this.durationFixationPresented.lowerbound, this.durationFixationPresented.upperbound) );
    this.showFixation = false;
    this.isResponseAllowed = true;
    this.timerService.startTimer();
    this.isStimulus = true;

    this.stimulusShownTimeout = setTimeout(() => {
      clearTimeout(this.stimulusShownTimeout)
      this.isStimulus = false;
    }, this.durationStimulusPresented)

    // This is the delay between showing the stimulus and showing the feedback
    this.responseTimeout = setTimeout(() => {
      if (!this.feedbackShown) {
        this.showFeedback();
      }
    }, this.maxResponseTime);
  }

  private showImage(blob: Blob) {
    const fr = new FileReader();
    fr.addEventListener("load", () => {
      this.stimulusShown = fr.result;
    })
    fr.readAsDataURL(blob);
  }

  generateStimulus() {
    this.currentTrialConfig = this.trials[this.currentTrial - 1]
    this.showImage(this.currentTrialConfig.blob);
    const nonTargetResponse = this.targetResponse === Key.Z ? Key.M : Key.Z;

    this.data.push({
      userID: this.authService.getDecodedToken().UserID,
      stimulus: this.currentTrialConfig.stimuli,
      targetResponse: this.targetResponse,
      responseTime: 0,
      trial: this.currentTrial,
      isCorrect: false,
      score: 0,
      userAnswer: UserResponse.NA,
      actualAnswer: this.currentTrialConfig.isTarget ? this.targetResponse : nonTargetResponse,
      submitted: this.timerService.getCurrentTimestamp(),
      isPractice: this.isPractice,
      experimentCode: this.taskManager.getExperimentCode(),
      target: this.targetImage,
      block: this.block
    })
  }

  async showFeedback() {
    clearTimeout(this.responseTimeout);
    clearTimeout(this.stimulusShownTimeout)
    this.feedbackShown = true;
    this.isStimulus = false;
    this.isResponseAllowed = false;

    const thisTrial = this.data[this.data.length - 1];
    const userAnswer = thisTrial.userAnswer;
    const actualAnswer = thisTrial.actualAnswer;

    switch (userAnswer) {
      case actualAnswer:
        this.feedback = Feedback.CORRECT;
        thisTrial.isCorrect = true;
        thisTrial.score = 10;
        this.scoreForSpecificTrial = 10;
        this.totalScore += 10;
        break;
      case UserResponse.NA:
        this.feedback = Feedback.TOOSLOW;
        thisTrial.responseTime = this.maxResponseTime;
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
        return;
      } else {
        this.proceedtoNextStep();
        await this.wait(2000);
        this.proceedtoNextStep();
        return;
      }
    } else {
      if (this.currentTrial < this.actualTrials) {
        // continue the block
        this.continueGame();
        return;
      } else {
        // we have finished the block
        this.proceedtoNextStep();

        // add in the novel stimuli for the last two trials
        if(this.block >= 2) this.includeNovelStimuli = true;
        
        // we have finished all the blocks
        if(this.block >= 4) {

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
        } else {
          // if we are not done with the task, take a break
          await this.wait(2000)
          this.startBreak();
        }

      }
    }
  }



  startBreak() {
    this.isBreak = true;
    this.breakTimeDisplayValue = 1;
    this.breakTimer = setInterval(() => {
      this.breakTimeDisplayValue += 1;
      if(this.breakTimeDisplayValue >= this.breakDuration) {
        this.stopBreak();
        return;
      }
    }, 1000)
  }

  async stopBreak() {
    clearInterval(this.breakTimer)
    this.isBreak = false;
    this.startActualGame();
  }



  async continueGame() {
    await this.wait(this.interTrialDelay);
    this.showStimulus();
  }



  uploadResults(data: Oddball[]): Observable<boolean> {
    const experimentCode = this.taskManager.getExperimentCode()
    return this.uploadDataService.uploadData(experimentCode, TaskNames.ODDBALL, data).pipe(
      map(ok => ok.ok)
    )
  }



  continueAhead() {
    const decodedToken = this.authService.getDecodedToken()
    if(decodedToken.Role === Role.ADMIN) {
      if(!environment.production) console.log(this.data)
      
      this.router.navigate(['/dashboard/components'])
      this.snackbarService.openInfoSnackbar("Task completed")
    } else {
      this.taskManager.next()
    }
  }





  reset() {
    this.stimulusShown = null;
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
