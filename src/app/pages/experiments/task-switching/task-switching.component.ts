import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Matrix } from './matrix';
import { DataService } from 'src/app/services/data.service';
declare function setFullScreen(): any;
@Component({
  selector: 'app-task-switching',
  templateUrl: './task-switching.component.html',
  styleUrls: ['./task-switching.component.scss']
})
export class TaskSwitchingComponent implements OnInit {

  isScored: boolean = false;
  showFeedbackAfterEveryTrial: boolean = false;
  showScoreAfterEveryTrial: boolean = false;
  numberOfBreaks: number = 0;
  maxResponseTime: number = 2500;
  durationOfFeedback: number = 500;
  interTrialDelay: number = 1000;
  practiceTrials: number = 20;
  actualTrials: number = 125;

  step: number = 1;
  color: string = 'transparent';
  number: number = 0;
  feedback: string = '';
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;
  isPractice: boolean = false;
  isStimulus: boolean = false;
  isBreak: boolean = false;
  fRepeat = true;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;
  data: {
    isPractice: number,
    color: string,
    digit: number,
    actualAnswer: string,
    userAnswer: string,
    responseTime: number,
    isCorrect: number,
    score: number,
    colorMapping: string
  }[] = [];
  timer: {
    started: number,
    ended: number
  } = {
      started: 0,
      ended: 0
    };
  showFixation: boolean = false;
  feedbackShown: boolean = false;
  matrix = {
    colors: [],
    digits: []
  };
  colorMapping = localStorage.getItem('mapping') === '1' ? ['blue', 'yellow'] : ['yellow', 'blue'];

  @HostListener('document:click', ['$event'])
  onKeyPress(event: MouseEvent) {
    if (this.isResponseAllowed) {
      this.isResponseAllowed = false;
      try {
        if (this.data[this.data.length - 1].color === this.colorMapping[0]) {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = this.timer.ended - this.timer.started;
          this.data[this.data.length - 1].userAnswer = 'GREATER';
        } else {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = this.timer.ended - this.timer.started;
          this.data[this.data.length - 1].userAnswer = 'EVEN';
        }
      } catch (error) {
      }
    }
  }

  constructor(
    private router: Router,
    private dataService: DataService,
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

  proceedtoPreviousStep(steps = 1) {
    if (steps > 1) {
      this.fRepeat = false;
    }
    this.step -= steps;
  }

  proceedtoNextStep(steps = 1) {
    this.step += steps;
  }

  processClickEvent(event: any) {
    if (this.isResponseAllowed) {
      this.isResponseAllowed = false;
      try {
        if (this.data[this.data.length - 1].color === this.colorMapping[0]) {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = this.timer.ended - this.timer.started;
          this.data[this.data.length - 1].userAnswer = 'LESSER';
        } else {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = this.timer.ended - this.timer.started;
          this.data[this.data.length - 1].userAnswer = 'ODD';
        }
      } catch (error) {
      }
    }
    event.preventDefault();
  }

  async startPractice(trials = 0) {
    if (trials !== 0) {
      this.practiceTrials = trials;
    }
    this.matrix = new Matrix(this.practiceTrials, 50);
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
    this.matrix = new Matrix(this.actualTrials, 50);
    this.resetData();
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
    this.isPractice = false;
    this.showFeedbackAfterEveryTrial = false;
    this.showScoreAfterEveryTrial = false;
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
  }

  generateStimulus() {
    const color = this.colorMapping[this.matrix.colors[this.currentTrial - 1] - 1];
    const digit = this.matrix.digits[this.currentTrial - 1];
    let answer = '';
    if (color === this.colorMapping[0]) {
      if (digit > 5) {
        answer = 'GREATER';
      } else {
        answer = 'LESSER';
      }
    } else {
      if (digit % 2 === 0) {
        answer = 'EVEN';
      } else {
        answer = 'ODD';
      }
    }
    this.color = color;
    this.number = digit;
    this.data.push({
      isPractice: this.isPractice ? 1 : 0,
      color,
      digit,
      actualAnswer: answer,
      userAnswer: '',
      responseTime: 0,
      isCorrect: 0,
      score: 0,
      colorMapping: this.colorMapping.join().toUpperCase()
    });
  }

  async showFeedback() {
    this.feedbackShown = true;
    this.isStimulus = false;
    this.isResponseAllowed = false;
    if (this.data[this.data.length - 1].responseTime === 0) {
      this.timer.ended = new Date().getTime();
      this.data[this.data.length - 1].responseTime = this.timer.ended - this.timer.started;
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
        console.log(this.data);
        this.uploadResults();
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
        this.uploadResults();
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
    if (this.data.length > 0) {
      let d = JSON.parse(JSON.stringify(this.data));
      this.dataService.uploadData('ts', d);
    }
  }

  continueAhead() {
    this.router.navigate(['/experiments/dst']);
  }

  reset() {
    this.number = 0;
    this.color = 'transparent';
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
