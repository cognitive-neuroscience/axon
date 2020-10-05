import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
declare function setFullScreen(): any;
import { Matrix } from './matrix';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-demand-selection',
  templateUrl: './demand-selection.component.html',
  styleUrls: ['./demand-selection.component.scss']
})
export class DemandSelectionComponent implements OnInit {

  // Default Experiment config
  isScored: boolean | number = true;
  showFeedbackAfterEveryTrial: boolean | number = true;
  showScoreAfterEveryTrial: boolean | number = false;
  numberOfBreaks: number = 0;
  durationOfFeedback: number = 1000;    // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  practiceTrials: number = 10;
  actualTrials: number = 75;
  showPatches: boolean = false;
  showNumber: boolean = false;
  step: number = 1;
  number: number = 0;
  feedback: string = '';
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;
  isPractice: boolean = false;
  isStimulus: boolean = false;
  isBreak: boolean = false;
  currentTrial: number = 0;
  isResponseAllowed: boolean = false;
  data: {
    isPractice: number,
    positions: string,
    patch: string,
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

  rows = [1, 2, 3, 4, 5, 6];
  cols = [1, 2, 3, 4, 5, 6];
  posA = 0;
  posB = 0;
  hover = 'left';
  colorMapping = localStorage.getItem('mapping') === '1' ? ['blue', 'yellow'] : ['yellow', 'blue'];
  color: string = this.colorMapping[0];
  block = 1;
  matrix = {
    digits: []
  };

  colorStim = [
    ['abstPa.bmp', 'abstPb.bmp'],
    ['abst01a.bmp', 'abst01b.bmp'],
    ['abst02a.bmp', 'abst02b.bmp'],
    ['abst03a.bmp', 'abst03b.bmp'],
    ['abst04a.bmp', 'abst04b.bmp'],
    ['abst05a.bmp', 'abst05b.bmp'],
    ['abst06a.bmp', 'abst06b.bmp'],
    ['abst07a.bmp', 'abst07b.bmp'],
    ['abst08a.bmp', 'abst08b.bmp'],
    ['abst09a.bmp', 'abst09b.bmp'],
    ['abst10a.bmp', 'abst10b.bmp'],
    ['abst11a.bmp', 'abst11b.bmp'],
    ['abst12a.bmp', 'abst12b.bmp'],
  ]

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
        this.showFeedback();
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

  proceedtoPreviousStep() {
    this.step -= 1;
  }

  proceedtoNextStep() {
    this.step += 1;
  }

  processClickEvent(event: any) {
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
        try {
          this.showFeedback();
        } catch (error) {
        }
      } catch (error) {
      }
    }
    event.preventDefault();
  }

  async startPractice() {
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
    if (this.block >= 5) {
      this.actualTrials = 35;
    }
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
    this.showNumber = false;
    this.showPatches = false;

    this.posA = 0;
    this.posB = 0;

    while (1) {
      this.posA = Math.floor(Math.random() * this.rows.length * this.cols.length) + 1;
      this.posB = Math.floor(Math.random() * this.rows.length * this.cols.length) + 1;
      if (this.posA !== this.posB && ![15, 16, 21, 22].includes(this.posA) && ![15, 16, 21, 22].includes(this.posB)) {
        break;
      }
    }
    console.log(this.posA, this.posB);

    await this.wait(200);

    this.currentTrial += 1;
    this.isStimulus = true;
  }

  onHoverCursor(event) {
    this.showPatches = true;
    this.showFixation = false;
    this.showNumber = false;
    this.isResponseAllowed = false;
    this.timer.started = 0;
    this.timer.ended = 0;
  }

  onHoverPatch(event, side = 'left') {
    this.hover = side;

    let switchingProb = 0.5;
    if (this.block >= 5) {
      switchingProb = side === 'left' ? 0.1 : 0.9;
    }

    if (this.currentTrial > 1) {
      if (Math.random() >= switchingProb) {
        this.color = this.color === 'blue' ? 'yellow' : 'blue';
      }
    } else {
      this.color = this.colorMapping[0];
    }

    const digit = this.matrix.digits[this.currentTrial - 1];
    let answer = '';
    if (this.color === this.colorMapping[0]) {
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
    this.number = digit;
    this.data.push({
      isPractice: this.isPractice ? 1 : 0,
      patch: side === 'left' ? 'A' : 'B',
      positions: [this.posA, this.posB].join(),
      color: this.color,
      digit,
      actualAnswer: answer,
      userAnswer: '',
      responseTime: 0,
      isCorrect: 0,
      score: 0,
      colorMapping: this.colorMapping.join().toUpperCase()
    });

    this.showPatches = false;
    this.showFixation = false;
    this.showNumber = true;
    this.isResponseAllowed = true;

    this.timer.started = new Date().getTime();
    this.timer.ended = 0;

    console.log(this.isPractice ? `Practice trial: ${this.currentTrial}` : `Actual trial: ${this.currentTrial}`);
  }

  async showFeedback() {
    this.feedbackShown = true;
    this.isStimulus = false;
    this.showPatches = false;
    this.showFixation = false;
    this.showNumber = false;
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
      // this.dataService.uploadData('dst', d);
    }
  }

  continueAhead() {
    this.router.navigate(['/dashboard']);
  }

  reset() {
    this.number = 0;
    this.feedback = '';
    this.feedbackShown = false;
    this.scoreForSpecificTrial = 0;
    this.showPatches = false;
    this.showFixation = false;
    this.showNumber = false;
    this.posA = 0;
    this.posB = 0;
  }

  resetData() {
    this.data = [];
    this.totalScore = 0;
  }

  getImage(side: string) {
    if (this.isPractice) {
      return `/assets/images/dst/abstP${side}.bmp`
    } else {
      return `/assets/images/dst/abst${this.block < 10 ? '0' : ''}${this.block}${side}.bmp`
    }
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
