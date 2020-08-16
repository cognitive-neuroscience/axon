import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
declare function setFullScreen(): any;

@Component({
  selector: 'app-digit-span',
  templateUrl: './digit-span.component.html',
  styleUrls: ['./digit-span.component.scss']
})
export class DigitSpanComponent implements OnInit {

  // Default Experiment config
  isScored: boolean | number = true;
  showFeedbackAfterEveryTrial: boolean | number = false;
  showScoreAfterEveryTrial: boolean | number = false;
  numberOfBreaks: number = 0;
  maxResponseTime: number = 0;        // In milliseconds, 0 for indefinte
  durationOfFeedback: number = 1000;    // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  practiceTrials: number = 1;
  actualTrials: number = 6;

  step: number = 1;
  digitShown: string = '';
  textShown: string = '';
  userAnswer: string = '';
  feedback: string = '';
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;
  isPractice: boolean = false;
  isStimulus: boolean = false;
  isKeypad: boolean = false;
  isFeedback: boolean = false;
  isBreak: boolean = false;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;

  accuracy: number = 0;
  failedAttempts: number = 0;
  correctAttempts: number = 0;
  numberLen: number = 3;

  data: {
    actualAnswer: string,
    userAnswer: string,
    responseTime: number,
    numberOfDigits: number,
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


  constructor(
    private router: Router,
    private dataService: DataService
  ) { }



  ngOnInit() {

  }



  processConsent(consent: Boolean) {
    if (consent) {
      this.proceedtoNextStep();
    } else {
      this.router.navigate(['/dashboard']);
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

    this.isStimulus = true;
    this.isKeypad = false;
    this.isFeedback = false;

    this.generateStimulus().then(async () => {
      this.data.push({
        userAnswer: '',
        actualAnswer: this.textShown,
        responseTime: 0,
        numberOfDigits: this.textShown.length,
        isCorrect: 0,
        score: 0
      });
      this.isStimulus = false;
      this.isKeypad = true;
      this.isResponseAllowed = true;
      this.timer.started = new Date().getTime();
      this.timer.ended = 0;
      console.log(this.isPractice ? `Practice trial: ${this.currentTrial}` : `Actual trial: ${this.currentTrial}`);
    })
  }



  generateStimulus() {
    if (this.failedAttempts >= 3) {
      this.numberLen -= 1;
      this.failedAttempts = 0;
      this.correctAttempts = 0;
    }
    if (this.correctAttempts >= 3) {
      this.numberLen += 1;
      this.correctAttempts = 0;
    }
    if (this.numberLen < 3) {
      this.numberLen = 3;
    }
    if (this.numberLen > 7) {
      this.numberLen = 7;
    }
    const min = this.getMaxMin(this.numberLen).min;
    const max = this.getMaxMin(this.numberLen).max;
    const numberToShow = Math.floor(Math.random() * (max - min + 1)) + min;
    const numAsArray = numberToShow.toString().split('').join('_').split('');
    this.userAnswer = '';
    this.textShown = numberToShow.toString();
    console.log(this.textShown, numAsArray);
    let promise = Promise.resolve();
    numAsArray.forEach((digit) => {
      promise = promise.then(() => {
        this.digitShown = digit === '_' ? '' : digit;
        return new Promise((resolve) => {
          setTimeout(resolve, digit === '_' ? 300 : 1000);
        });
      });
    });
    return promise;
  }


  getMaxMin(len: number) {
    const ret = {
      min: 100,
      max: 999
    };
    switch (len) {
      case 4: ret.min = 1000; ret.max = 9999; break;
      case 5: ret.min = 10000; ret.max = 99999; break;
      case 6: ret.min = 100000; ret.max = 999999; break;
      case 7: ret.min = 1000000; ret.max = 9999999; break;
    }
    return ret;
  }



  addNumber(num: number) {
    this.userAnswer += num.toString();
  }



  async showFeedback() {
    this.data[this.data.length - 1].userAnswer = this.userAnswer;
    this.isStimulus = false;
    this.isKeypad = false;
    this.isFeedback = true;
    this.isResponseAllowed = false;
    if (this.data[this.data.length - 1].responseTime === 0) {
      this.timer.ended = new Date().getTime();
      this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
    }
    console.log()
    if (this.data[this.data.length - 1].actualAnswer === this.data[this.data.length - 1].userAnswer) {
      this.feedback = "Correct";
      this.data[this.data.length - 1].isCorrect = 1;
      this.data[this.data.length - 1].score = 10;
      this.scoreForSpecificTrial = 10;
      this.totalScore += 10;
      this.correctAttempts += 1;
      this.failedAttempts = 0;
    } else {
      this.feedback = "Incorrect";
      this.data[this.data.length - 1].isCorrect = 0;
      this.data[this.data.length - 1].score = 0;
      this.scoreForSpecificTrial = 0;
      this.correctAttempts = 0;
      this.failedAttempts += 1;
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
    this.textShown = '';
    this.feedback = '';
    this.textShown = '';
    this.digitShown = '';
    this.scoreForSpecificTrial = 0;
  }



  resetData() {
    this.data = [];
    this.totalScore = 0;
    this.accuracy = 0;
    this.numberLen = 3;
    this.correctAttempts = 0;
    this.failedAttempts = 0;
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
