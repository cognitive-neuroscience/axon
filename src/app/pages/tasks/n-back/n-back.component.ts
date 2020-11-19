import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NBack } from 'src/app/models/TaskData';
import { UploadDataService } from 'src/app/services/uploadData.service';
declare function setFullScreen(): any;
import * as Set1 from './stimuli_1_1';
import * as Set2 from './stimuli_2_1';
import * as Set3 from './stimuli_3_1';
import * as Set4 from './stimuli_4_1';
import * as PracticeSet from './stimuli_practice';
import { TaskManagerService } from '../../../services/task-manager.service';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { Role } from 'src/app/models/InternalDTOs';
import { NBackStimuli } from '../../../models/TaskData';

@Component({
  selector: 'app-n-back',
  templateUrl: './n-back.component.html',
  styleUrls: ['./n-back.component.scss']
})
export class NBackComponent implements OnInit {

  // Default Experiment config
  userID: string = ""
  isScored: boolean | number = true;
  showFeedbackAfterEveryTrial: boolean | number = true;
  showScoreAfterEveryTrial: boolean | number = false;
  numberOfBreaks: number = 0;
  maxResponseTime: number = 2000;        // In milliseconds
  durationOfFeedback: number = 500;    // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  // practiceTrials: number = 15;
  // actualTrials: number = 143;
   practiceTrials: number = 5;
  actualTrials: number = 5;

  step: number = 1;
  feedback: string = '';
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;
  isPractice: boolean = false;
  isStimulus: boolean = false;
  isBreak: boolean = false;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;
  data: NBack[] = [];
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
  currentLetter: string;
  nback: string;

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      if (this.isResponseAllowed) {
        this.isResponseAllowed = false;
        try {
          if (!!event.key) {
            this.timer.ended = new Date().getTime();
            this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
            switch (event.key) {
              case 'ArrowLeft': this.data[this.data.length - 1].userAnswer = 'NO'; break;
              case 'ArrowRight': this.data[this.data.length - 1].userAnswer = 'YES'; break;
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
  }


  constructor(
    private router: Router,
    private uploadDataService: UploadDataService,
    private taskManager: TaskManagerService,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) { }



  ngOnInit() {
    const decodedToken = this.authService.getDecodedToken()
    if(!this.taskManager.hasExperiment() && decodedToken.Role !== Role.ADMIN) {
      this.router.navigate(['/login/mturk'])
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

    // This is the delay between showing the stimulus and showing the feedback
    this.sTimeout = setTimeout(() => {
      if (!this.feedbackShown) {
        this.showFeedback();
      }
    }, this.maxResponseTime);

  }



  generateStimulus() {
    const setNum = this.isPractice ? 0 : this.set;
    let selectedSet: NBackStimuli
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
      default:
        selectedSet = PracticeSet
        break;
    }

    this.currentLetter = selectedSet.set[this.currentTrial - 1].currentLetter;
    this.nback = selectedSet.set[this.currentTrial - 1].nback

    this.data.push({
      trial: this.currentTrial,
      userID: this.userID,
      actualAnswer: this.currentLetter === this.nback ? 'YES' : 'NO',
      userAnswer: 'NA',
      responseTime: 0,
      isCorrect: false,
      score: 0,
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
    // show feedback either if it is a practice trial, or if the feedback is telling the user
    // they are too slow. Don't show for other feedback during actual game
    if (this.isPractice || (this.showFeedbackAfterEveryTrial && this.feedback === 'Too slow')) {
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
        this.proceedtoNextStep()

        const decodedToken = this.authService.getDecodedToken()

        // if admin, then this task is in debug mode and we do not want to upload tasks
        if(decodedToken.Role === Role.ADMIN) {
          this.proceedtoNextStep()
        } else {

          this.uploadResults(this.data).subscribe(ok => {
            if(ok) {
              this.proceedtoNextStep()
            } else {
              this.router.navigate(['/login/mturk'])
              console.error("There was an error uploading the results")
              this.snackbarService.openErrorSnackbar("There was an error uploading the results")
            }
          }, err => {
            this.router.navigate(['/login/mturk'])
            console.error("There was an error uploading the results")
            this.snackbarService.openErrorSnackbar("There was an error uploading the results")
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



  uploadResults(data: NBack[]): Observable<boolean> {
    const experimentCode = this.taskManager.getExperimentCode()
    return this.uploadDataService.uploadData(experimentCode, "nback", data).pipe(
      map(ok => ok.ok)
    )
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
    this.currentLetter = '';
    this.nback = '';
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
