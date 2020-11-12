import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UploadDataService } from 'src/app/services/uploadData.service';
declare function setFullScreen(): any;

@Component({
  selector: 'app-smiley-face',
  templateUrl: './smiley-face.component.html',
  styleUrls: ['./smiley-face.component.scss']
})
export class SmileyFaceComponent implements OnInit {

  // Default Experiment config
  isScored: boolean | number = true;
  showFeedbackAfterEveryTrial: boolean | number = true;
  showScoreAfterEveryTrial: boolean | number = true;
  numberOfBreaks: number = 2;
  maxResponseTime: number = 800;        // In milliseconds
  durationOfFeedback: number = 1750;    // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  practiceTrials: number = 5;
  actualTrials: number = 10;

  step: number = 1;
  size: string = 'no';
  feedback: string = '';
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;
  isPractice: boolean = false;
  isStimulus: boolean = false;
  isBreak: boolean = false;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;
  data: {
    actualAnswer: string,
    userAnswer: string,
    responseTime: number,
    isCorrect: number,
    score: number
  }[] = [];
  timer: {
    started: number,
    ended: number
  } = {
      started: 0,
      ended: 0
    };
  showFixation: boolean = false;
  sTimeout: any;
  feedbackShown: boolean = false;

  @HostListener('window:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.isResponseAllowed) {
      this.isResponseAllowed = false;
      try {
        if (event.key === 'Z' || event.key === 'z') {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
          this.data[this.data.length - 1].userAnswer = 'Z';
          try {
            clearTimeout(this.sTimeout);
            this.showFeedback();
          } catch (error) {
          }
        } else if (event.key === 'M' || event.key === 'm') {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
          this.data[this.data.length - 1].userAnswer = 'M';
          try {
            clearTimeout(this.sTimeout);
            this.showFeedback();
          } catch (error) {
          }
        } else {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
          this.data[this.data.length - 1].userAnswer = 'INVALID';
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
    private uploadDataService: UploadDataService
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
    this.isStimulus = true;
    this.size = 'no';
    await this.wait(500);

    this.currentTrial += 1;
    this.generateStimulus();

    await this.wait(100);
    this.size = 'no';

    this.isResponseAllowed = true;

    this.timer.started = new Date().getTime();
    this.timer.ended = 0;

    console.log(this.isPractice ? `Practice trial: ${this.currentTrial}` : `Actual trial: ${this.currentTrial}`);
  }



  generateStimulus() {

    this.size = Math.random() > 0.5 ? 'short' : 'long';

    this.data.push({
      actualAnswer: this.size === 'short' ? 'Z' : 'M',
      userAnswer: '',
      responseTime: 0,
      isCorrect: 0,
      score: 0
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
      this.data[this.data.length - 1].isCorrect = 1;
      this.data[this.data.length - 1].score = 10;
      this.scoreForSpecificTrial = 10;
      this.totalScore += 10;
    } else {
      if (this.data[this.data.length - 1].userAnswer === '') {
        this.feedback = "Too slow";
      } else {
        this.feedback = "Incorrect";
      }
      this.data[this.data.length - 1].isCorrect = 0;
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
        await this.wait(2000);
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
    await this.wait(this.interTrialDelay);
    this.showStimulus();
  }



  uploadResults() {
  }



  continueAhead() {
    this.router.navigate(['/dashboard']);
  }




  reset() {
    this.size = '';
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
