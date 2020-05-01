import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
declare function setFullScreen(): any;
import { Matrix } from './matrix';

@Component({
  selector: 'app-demand-selection',
  templateUrl: './demand-selection.component.html',
  styleUrls: ['./demand-selection.component.scss']
})
export class DemandSelectionComponent implements OnInit {

  // Default Experiment config 
  isScored: boolean | number = true;
  showFeedbackAfterEveryTrial: boolean | number = true;
  showScoreAfterEveryTrial: boolean | number = true;
  numberOfBreaks: number = 2;
  maxResponseTime: number = 2500;        // In milliseconds
  durationOfFeedback: number = 1000;    // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  practiceTrials: number = 10;
  actualTrials: number = 30;
  showPatches: boolean = false;
  showNumber: boolean = false;
  step: number = 1;
  color: string = 'transparent';
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
    color: string,
    digit: number,
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

  rows = [1, 2, 3, 4, 5, 6];
  cols = [1, 2, 3, 4, 5, 6];
  posA = 0;
  posB = 0;
  hover = 'left';

  matrix = new Matrix();

  @HostListener('document:click', ['$event'])
  onKeyPress(event: MouseEvent) {
    if (this.isResponseAllowed) {
      this.isResponseAllowed = false;
      try {
        if (this.data[this.data.length - 1].color === 'blue') {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
          this.data[this.data.length - 1].userAnswer = 'LESSER';
        } else {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
          this.data[this.data.length - 1].userAnswer = 'ODD';
        }
        try {
          clearTimeout(this.sTimeout);
          this.showFeedback();
        } catch (error) {
        }
      } catch (error) {
      }
    }
  }


  constructor(
    private router: Router,
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
        if (this.data[this.data.length - 1].color === 'blue') {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
          this.data[this.data.length - 1].userAnswer = 'GREATER';
        } else {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
          this.data[this.data.length - 1].userAnswer = 'EVEN';
        }
        try {
          clearTimeout(this.sTimeout);
          this.showFeedback();
        } catch (error) {
        }
      } catch (error) {
      }
    }
    event.preventDefault();
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
    let rand = 0;
    if (side === 'left') {
      rand = this.matrix.colors[this.currentTrial - 1];
    } else {
      rand = this.matrix.colors2[this.currentTrial - 1];
    }

    let color = 'blue';
    if (rand === 1) {
      color = 'blue';
    } else {
      color = 'green';
    }
    const digit = this.matrix.digits[this.currentTrial - 1];
    let answer = '';
    if (color === 'green') {
      if (digit % 2 === 0) {
        answer = 'EVEN';
      } else {
        answer = 'ODD';
      }
    } else {
      if (digit > 5) {
        answer = 'GREATER';
      } else {
        answer = 'LESSER';
      }
    }

    this.color = color;
    this.number = digit;

    this.data.push({
      color: color,
      digit: digit,
      actualAnswer: answer,
      userAnswer: '',
      responseTime: 0,
      isCorrect: 0,
      score: 0
    });

    this.showPatches = false;
    this.showFixation = false;
    this.showNumber = true;
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
      }
    } else {
      if (this.currentTrial < this.actualTrials) {
        if (this.numberOfBreaks === 0) {
          this.continueGame();
        } else {
          let breakAtTrailIndices = [];
          let setSize = this.actualTrials / (this.numberOfBreaks + 1);
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
    this.number = 0;
    this.color = 'transparent';
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
