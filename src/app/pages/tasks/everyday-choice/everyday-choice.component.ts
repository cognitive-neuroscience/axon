import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UploadDataService } from 'src/app/services/uploadData.service';
import { TaskManagerService } from '../../../services/task-manager.service';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { ratingTask } from '../../../models/TaskData';
import { pracSet } from './stimuli_practice';
import { taskSet } from './stimuli_task';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Key, Role } from 'src/app/models/InternalDTOs';
import { TimerService } from 'src/app/services/timer.service';

declare function setFullScreen(): any;

@Component({
  selector: 'app-everyday-choice',
  templateUrl: './everyday-choice.component.html',
  styleUrls: ['./everyday-choice.component.scss']
})
export class EverydayChoiceComponent implements OnInit {

  userID: string;
  isScored: boolean | number = false;
  showFeedbackAfterEveryTrial: boolean | number = false;
  showScoreAfterEveryTrial: boolean | number = false;
  numberOfBreaks: number = 0;
  maxResponseTime: number = 30000;
  durationOfFeedback: number;    // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  practiceTrials: number = 1;
  actualTrials: number = 45;  //change into number of activities
  delayToShowHelpMessage: number = 20000; //delay to show help message
  durationHelpMessageShown: number = 10000;

  step: number = 1;
  currentActivity: string = '';
  currentSet: string[];
  currentPracSet: string[];
  currentTaskSet: string[];
  ratingType: string = '';
  done_one_part: boolean = false;
  done_both_part: boolean = false;

  isPractice: boolean = false;
  isStimulus: boolean = false;
  isRatingscale: boolean = false;
  isBreak: boolean = false;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;
  data: ratingTask[] = [];
  timer: {
    started: number,
    ended: number
  } = {
      started: 0,
      ended: 0
    };
  //set: number;
  counterbalance: number;
  showFixation: boolean = false;
  sTimeout: any;
  feedbackShown: boolean = false;
  snackbarTimeout: any;

  @HostListener('window:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.isResponseAllowed && this.isValidKey(event.key)) {
      this.isResponseAllowed = false;
      try {
        if (!!event.key) {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2)); //what is this
          switch (event.key) {
            case '1': this.data[this.data.length - 1].userAnswer = 1; break;
            case '2': this.data[this.data.length - 1].userAnswer = 2; break;
            case '3': this.data[this.data.length - 1].userAnswer = 3; break;
            case '4': this.data[this.data.length - 1].userAnswer = 4; break;
            case '5': this.data[this.data.length - 1].userAnswer = 5; break;
            //default: this.data[this.data.length - 1].userAnswer = ''; break;
          }
          this.data[this.data.length - 1].submitted = this.timerService.getCurrentTimestamp();

          try {
            this.cancelHelpMessage();
            clearTimeout(this.sTimeout);
            this.showFeedback();
          } catch (error) {
          }
        }
      } catch (error) {
      }
    }
  }

  constructor(
    private router: Router,
    private uploadDataService: UploadDataService,
    private taskManager: TaskManagerService,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    private timerService: TimerService
  ) { }


  ngOnInit() {

    const decodedToken = this.authService.getDecodedToken()
    this.counterbalance = Math.floor(Math.random() * 2); //returns 0 or 1
    // if (!this.taskManager.hasExperiment() && decodedToken.Role !== Role.ADMIN) {
    //   this.router.navigate(['/login/mturk'])
    //   this.snackbarService.openErrorSnackbar("Refresh has occurred")
    // }

    // const jwt = this.authService.getDecodedToken()
    // this.userID = jwt.UserID
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
    this.currentPracSet = this.shuffleStimulus(pracSet);
    this.proceedtoNextStep();
    this.isPractice = true;
    this.currentTrial = 0;
    this.showStimulus();
  }



  async startActualGame() {
    this.resetData();
    this.proceedtoNextStep();
    await this.wait(2000);
    this.currentTaskSet = this.shuffleStimulus(taskSet);
    this.proceedtoNextStep();
    this.isPractice = false;
    this.currentTrial = 0;
    this.showStimulus();
  }



  async showStimulus() {

    this.reset();
    this.showFixation = false;
    await this.wait(500);


    this.currentTrial += 1;
    this.generateStimulus();


    this.isStimulus = true;
    this.timer.started = new Date().getTime();
    this.timer.ended = 0;
    await this.wait(1500);
    this.isRatingscale = true;
    this.isResponseAllowed = true;

    

    this.showHelpMessage("Please make the rating by pressing the corresponding number key", this.delayToShowHelpMessage, this.durationHelpMessageShown);

    // This is the delay between showing the stimulus and showing the feedback
    this.sTimeout = setTimeout(() => {
      if (!this.feedbackShown) {
        // If no response during response window, showing a reminder to respond in time next trial
        const message = "Please do your best to provide your answer in the time allotted for the next trial.";
        this.snackbarService.openInfoSnackbar(message, undefined, this.interTrialDelay);
        this.showFeedback();
      }
    }, this.maxResponseTime);

  }

  private isValidKey(key: string): boolean {
    if(key === Key.NUMONE || key === Key.NUMTWO || key === Key.NUMTHREE || key === Key.NUMFOUR || key === Key.NUMFIVE ) return true;
    return false;
  }


  private showHelpMessage(helpMessage: string, delay: number, duration: number) {
    this.snackbarTimeout = setTimeout(() => {
      this.snackbarService.openErrorSnackbar(helpMessage, "", duration);
    }, delay)
  }

  private cancelHelpMessage() {
    this.snackbarService.clearSnackbar();
    clearTimeout(this.snackbarTimeout);
  }



  private shuffleStimulus(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  generateStimulus() {

    if (this.isPractice == true) {
      this.currentSet = this.currentPracSet
    }
    else {
      this.currentSet = this.currentTaskSet
    }

    this.currentActivity = this.currentSet[this.currentTrial - 1];

    if (this.counterbalance == 0) {
      if (this.done_one_part == false) {
        this.ratingType = 'like'
      }
      else {
        this.ratingType = 'should'
      }
    } else {
      if (this.done_one_part == false) {
        this.ratingType = 'should'
      }
      else {
        this.ratingType = 'like'
      }
    }


    this.data.push({
      trial: this.currentTrial,
      userID: this.userID,
      counterbalance: this.counterbalance,
      ratingType: this.ratingType,
      userAnswer: null,
      activity: this.currentActivity,
      responseTime: 0,
      score: 0,
      submitted: this.timerService.getCurrentTimestamp(),
      isCorrect: false,
      isPractice: false,
      experimentCode: this.taskManager.getExperimentCode(),
    });
  }



  async showFeedback() {
    this.feedbackShown = true;
    this.isStimulus = false;
    this.isRatingscale = false;
    this.isResponseAllowed = false;

    if (this.data[this.data.length - 1].responseTime === 0) {
      this.data[this.data.length - 1].responseTime = this.maxResponseTime;
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
      } else if (!this.done_one_part && !this.done_both_part) {
        this.done_one_part = true;
        this.proceedtoNextStep(); //loader
        await this.wait(2000);
        this.proceedtoNextStep();  //show first part complete msg
      }
      else {
        this.done_both_part = true;
        this.proceedtoNextStep();
        const decodedToken = this.authService.getDecodedToken()
        if (decodedToken.Role === Role.ADMIN) {
          this.proceedtoNextStep()
        } else {

          this.uploadResults(this.data).subscribe(ok => {
            if (ok) {
              this.proceedtoNextStep();
            } else {
              this.router.navigate(['/login/mturk'])
              console.error("There was an error uploading the results");
              this.snackbarService.openErrorSnackbar("There was an error uploading the results");
            }
          }, err => {
            this.router.navigate(['/login/mturk'])
            console.log("There was an error uploading the results");
            this.snackbarService.openErrorSnackbar("There was an error uploading the results");
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



  uploadResults(data: ratingTask[]): Observable<boolean> {
    const experimentCode = this.taskManager.getExperimentCode()
    return this.uploadDataService.uploadData(experimentCode, "ratingTask", data).pipe(
      map(ok => ok.ok)
    )
  }



  continueAhead() {
    const decodedToken = this.authService.getDecodedToken()
    if (decodedToken.Role === Role.ADMIN) {
      this.router.navigate(['/dashboard/tasks'])
      this.snackbarService.openInfoSnackbar("Task completed")
    } else {
      this.taskManager.nextExperiment()
    }
  }




  reset() {
    this.currentActivity = '';
    this.feedbackShown = false;
    this.ratingType = 'NA'; //CHANGE??
  }



  resetData() {
    this.data = [];

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





