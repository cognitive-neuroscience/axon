import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
declare function setFullScreen(): any;
import * as Set1 from './stimuli_1_1';
import * as Set2 from './stimuli_2_1';
import * as Set3 from './stimuli_3_1';
import * as Set4 from './stimuli_4_1';
import { TaskManagerService } from '../../../services/task-manager.service';
import { StroopTask } from '../../../models/TaskData';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-stroop-task',
  templateUrl: './stroop-task.component.html',
  styleUrls: ['./stroop-task.component.scss']
})
export class StroopTaskComponent implements OnInit {

  // Default Experiment config
  userID: string;
  isScored: boolean | number = true;
  showFeedbackAfterEveryTrial: boolean | number = false;
  showScoreAfterEveryTrial: boolean | number = false;
  numberOfBreaks: number = 0;
  maxResponseTime: number = 2000;        // In milliseconds
  durationOfFeedback: number = 500;    // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  practiceTrials: number = 3;
  actualTrials: number = 3;

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
  timer: {
    started: number,
    ended: number
  } = {
      started: 0,
      ended: 0
    };
  set: number;
  showFixation: boolean = false;
  sTimeout: any;
  feedbackShown: boolean = false;

  @HostListener('window:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.isResponseAllowed) {
      this.isResponseAllowed = false;
      try {
        if (!!event.key) {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
          switch (event.key) {
            case '1': this.data[this.data.length - 1].userAnswer = 'red'; break;
            case '2': this.data[this.data.length - 1].userAnswer = 'blue'; break;
            case '3': this.data[this.data.length - 1].userAnswer = 'green'; break;
            default: this.data[this.data.length - 1].userAnswer = ''; break;
          }
          try {
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
    private dataService: DataService,
    private taskManager: TaskManagerService,
    private snackbarService: SnackbarService,
    private authService: AuthService
  ) { }



  ngOnInit() {
    this.set = Math.floor(Math.random() * 4) + 1;
    const jwt = this.authService.getDecodedToken()
    this.userID = jwt.UserID
  }



  processConsent(consent: Boolean) {
    if (consent) {
      this.proceedtoNextStep();
    } else {
      this.router.navigate(['/login/mturk']);
    }
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
    this.showFixation = true;
    await this.wait(500);
    this.showFixation = false;
    await this.wait(200);

    this.currentTrial += 1;
    this.generateStimulus();
    this.isStimulus = true;
    this.isResponseAllowed = true;

    this.timer.started = new Date().getTime();
    this.timer.ended = 0;

    console.log(this.isPractice ? `Practice trial: ${this.currentTrial}` : `Actual trial: ${this.currentTrial}`);

    // This is the delay between showing the stimulus and showing the feedback
    this.sTimeout = setTimeout(() => {
      if (!this.feedbackShown) {
        this.showFeedback();
      }
    }, this.maxResponseTime);

  }



  generateStimulus() {
    switch (this.set) {
      case 1:
        this.color = Set1.set[this.currentTrial - 1 + (this.isPractice ? 0 : 10)].color;
        this.text = Set1.set[this.currentTrial - 1 + (this.isPractice ? 0 : 10)].word;
        break;
      case 2:
        this.color = Set2.set[this.currentTrial - 1 + (this.isPractice ? 0 : 10)].color;
        this.text = Set2.set[this.currentTrial - 1 + (this.isPractice ? 0 : 10)].word;
        break;
      case 3:
        this.color = Set3.set[this.currentTrial - 1 + (this.isPractice ? 0 : 10)].color;
        this.text = Set3.set[this.currentTrial - 1 + (this.isPractice ? 0 : 10)].word;
        break;
      case 4:
        this.color = Set4.set[this.currentTrial - 1 + (this.isPractice ? 0 : 10)].color;
        this.text = Set4.set[this.currentTrial - 1 + (this.isPractice ? 0 : 10)].word;
        break;
    }

    this.data.push({
      userID: this.userID,
      trial: this.currentTrial,
      actualAnswer: this.color,
      userAnswer: 'NA',
      isCongruent: this.color === this.text ? true : false,
      responseTime: null,
      isCorrect: null,
      score: null,
      set: this.set
    });
  }



  async showFeedback() {
    this.feedbackShown = true;
    this.isStimulus = false;
    this.isResponseAllowed = false;

    if (this.data[this.data.length - 1].responseTime === 0) {
      this.timer.ended = new Date().getTime();
      this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
    }

    if (this.data[this.data.length - 1].actualAnswer === this.data[this.data.length - 1].userAnswer) {
      this.feedback = "Correct";
      this.data[this.data.length - 1].isCorrect = true;
      this.data[this.data.length - 1].score = 10;
      this.scoreForSpecificTrial = 10;
      this.totalScore += 10;
    } else {
      if (this.data[this.data.length - 1].userAnswer === 'NA') {
        this.feedback = "Too slow"
      } else {
        this.feedback = "Incorrect";
      }
      this.data[this.data.length - 1].isCorrect = false;
      this.data[this.data.length - 1].score = 0;
      this.scoreForSpecificTrial = 0;
    }

    if (this.showFeedbackAfterEveryTrial || this.isPractice) {
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
        console.log(this.data);
        this.uploadResults(this.data).subscribe(ok => {
          if(ok) {
            this.proceedtoNextStep();
          } else {
            console.error("There was an error uploading the results")
            this.snackbarService.openErrorSnackbar("There was an error uploading the results")
          }
        }, err => {
          this.router.navigate(['/login/mturk'])
          this.snackbarService.openErrorSnackbar("There was an error")
        })
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
    return this.dataService.uploadData(experimentCode, "Stroop Task", data).pipe(
      map(ok => ok.ok)
    )
  }



  continueAhead() {
    this.taskManager.nextExperiment()
  }




  reset() {
    this.color = '';
    this.text = '';
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
