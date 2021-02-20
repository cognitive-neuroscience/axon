import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UploadDataService } from 'src/app/services/uploadData.service';
import { TaskManagerService } from '../../../services/task-manager.service';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Key, UserResponse } from 'src/app/models/InternalDTOs';
import { ChoiceTask, TaskNames } from '../../../models/TaskData';
import { pracSet } from './stimuli_task';
import { activityList } from './activityList';
import { TimerService } from 'src/app/services/timer.service';
import { generateRandomNonrepeatingNumberList, getRandomNumber, wait } from 'src/app/common/commonMethods';
import { environment } from 'src/environments/environment';

export class ActivityPair {
  constructor(
      readonly activityA: string,
      readonly activityB: string
  ) {}
}

declare function setFullScreen(): any;

@Component({
  selector: 'app-choice-task',
  templateUrl: './choice.component.html',
  styleUrls: ['./choice.component.scss']
})
export class ChoiceComponent implements OnInit {

  isScored: boolean | number = false;
  maxResponseTime: number = 30000;       // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  practiceTrials: number = 1;
  actualTrials: number = 45;  //change into number of activities
  delayToShowHelpMessage: number = 20000; //delay to show help message, change to 10000
  durationHelpMessageShown: number = 10000;

  step: number = 1;
  currentSet: ActivityPair[]; //the stimulus set of choice pairs currently used (can be practice or task)
  currentActivityPair: ActivityPair;
  currentActivityLeft: string = '';
  currentActivityRight: string = '';

  isPractice: boolean = false;
  isStimulus: boolean = false;
  isRatingscale: boolean = false;
  isBreak: boolean = false;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;
  data: ChoiceTask[] = [];

  sTimeout: any;
  snackbarTimeout: any;

  
  @HostListener('window:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.isResponseAllowed && this.isValidKey(event.key)) {
      this.cancelHelpMessage();
      clearTimeout(this.sTimeout);
      this.isResponseAllowed = false;
      const thisTrial = this.data[this.data.length - 1];

      thisTrial.responseTime = this.timerService.stopTimerAndGetTime();
      thisTrial.submitted = this.timerService.getCurrentTimestamp();
      thisTrial.userAnswer = event.key;

      this.showFeedback();
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
  }

  proceedtoPreviousStep() {
    this.step -= 1;
  }



  proceedtoNextStep() {
    this.step += 1;
  }


  async startPractice() {
    this.startGameInFullScreen();
    this.proceedtoNextStep();
    await wait(2000);
    this.currentSet = this.generatedRandomActivityPairs(pracSet);
    this.practiceTrials = this.currentSet.length;
    this.proceedtoNextStep();
    this.isPractice = true;
    this.currentTrial = 0;
    this.showStimulus();
  }



  async startActualGame() {
    this.proceedtoNextStep();
    this.currentSet = this.generatedRandomActivityPairs(environment.production ? activityList : activityList.slice(0, 10));
    this.actualTrials = this.currentSet.length;
    await wait(2000);
    this.proceedtoNextStep();
    this.isPractice = false;
    this.currentTrial = 0;  
    this.showStimulus();
  }

  async showStimulus() {

    this.reset();
    await wait(500);

    this.currentTrial += 1;
    this.generateStimulus();

    this.isStimulus = true;
    await wait(1500);
    this.isRatingscale = true;

    // This is the delay between showing the stimulus and showing the feedback
    this.sTimeout = setTimeout(() => {
      // If no response during response window, showing a reminder to respond in time next trial
      const message = "Please do your best to provide your answer in the time allotted for the next trial.";
      this.snackbarService.openInfoSnackbar(message, undefined, this.interTrialDelay);
      this.showFeedback();
    }, this.maxResponseTime);

    this.timerService.startTimer();
    this.isResponseAllowed = true;

    this.showHelpMessage("Please make the rating by pressing the corresponding number key", this.delayToShowHelpMessage, this.durationHelpMessageShown);

  }

  private isValidKey(key: string): boolean {
    switch (key) {
      case Key.NUMONE:
      case Key.NUMTWO:
      case Key.NUMTHREE:
      case Key.NUMFOUR:
      case Key.NUMFIVE:
        return true;
      default:
        return false;
    }
  }

  private showHelpMessage(helpMessage: string, delay: number, duration: number) { //, duration: number
    this.snackbarTimeout = setTimeout(() => {
      this.snackbarService.openInfoSnackbar(helpMessage, "", duration);
    }, delay)
  }

  private cancelHelpMessage() {
    this.snackbarService.clearSnackbar();
    clearTimeout(this.snackbarTimeout);
  }

  generatedRandomActivityPairs(activities: string[]): ActivityPair[] {
    if(activities.length <= 1) throw new Error("At least two activities are needed to make a pair list");
    if(activities.length == 2) return [new ActivityPair(activities[0], activities[1])];
    if(new Set<string>(activities).size !== activities.length) throw new Error("Cannot have duplicate activities");

    // copy the array
    const shuffledActivities = this.shuffleStimulus([...activities]);
    const pairs: ActivityPair[] = [];

    for(let i = 0; i < shuffledActivities.length; i++) {
      pairs.push(new ActivityPair(shuffledActivities[i], shuffledActivities[ (i+1) % shuffledActivities.length ]));
    }

    return pairs;
  }

  // takes an array of any type and shuffles the items inside (or the references)
  private shuffleStimulus(array: any[]) {
    let currentIndex = array.length, temporaryValue: any, randomIndex: number;

    // While there remain elements to shuffle
    while (0 !== currentIndex) {
      // Pick a remaining element
      randomIndex = getRandomNumber(0, currentIndex);
      currentIndex--;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  generateStimulus() {
    this.currentActivityPair = this.currentSet[this.currentTrial - 1];
    this.currentActivityLeft = this.currentActivityPair.activityA;
    this.currentActivityRight = this.currentActivityPair.activityB;

    this.data.push({
      trial: this.currentTrial,
      userID: this.authService.getDecodedToken().UserID,
      userAnswer: UserResponse.NA,
      activityLeft: this.currentActivityLeft,
      activityRight: this.currentActivityRight,
      responseTime: 0,
      score: null,
      submitted: this.timerService.getCurrentTimestamp(),
      isCorrect: null,
      isPractice: this.isPractice,
      experimentCode: this.taskManager.getExperimentCode(),
    });
  }


  async showFeedback() {
    this.isStimulus = false;
    this.isRatingscale = false;
    this.isResponseAllowed = false;

    if (this.data[this.data.length - 1].userAnswer === UserResponse.NA) {
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
        await wait(2000);
        this.proceedtoNextStep();
      }
    } else {
      if (this.currentTrial < this.actualTrials) {
        this.continueGame();
      }
      else {
        this.proceedtoNextStep();

        if (this.authService.isAdmin()) {
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


  async continueGame() {
    await wait(this.interTrialDelay);
    this.showStimulus();
  }



  uploadResults(data: ChoiceTask[]): Observable<boolean> {
    const experimentCode = this.taskManager.getExperimentCode()
    return this.uploadDataService.uploadData(experimentCode, TaskNames.CHOICE, data).pipe(
      map(ok => ok.ok)
    )
  }



  continueAhead() {
    if (this.authService.isAdmin()) {
      console.log(this.data);
      this.router.navigate(['/dashboard/components'])
      this.snackbarService.openInfoSnackbar("Task completed")
    } else {
      this.taskManager.next()
    }
  }




  reset() {
    this.timerService.clearTimer();
    this.currentActivityLeft = '';
    this.currentActivityRight = '';
  }


  startGameInFullScreen() {
    setFullScreen();
  }
}

