import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-go-nogo',
  templateUrl: './go-nogo.component.html',
  styleUrls: ['./go-nogo.component.scss']
})
export class GoNogoComponent implements OnInit {

  step: number = 1;

  color: string = '';
  feedback: string = '';
  isScored: boolean = true;
  showFeedbackAfterEveryTrial: boolean = true;
  showScoreAfterEveryTrial: boolean = true;
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;

  isPractice: boolean = false;
  isStimulus: boolean = false;

  practiceTrials: number = 1;
  actualTrials: number = 10;
  currentTrial: number = 0;

  isResponseAllowed: boolean = false;

  data: {
    actualAnswer: string,
    userAnswer: string,
    responseTime: number
  }[] = [];

  timer: {
    started: number,
    ended: number
  } = {
      started: 0,
      ended: 0
    };

  @HostListener('window:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.isResponseAllowed) {
      try {
        if (event.key === ' ') {
          this.timer.ended = new Date().getTime();
          this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
          this.data[this.data.length - 1].userAnswer = 'responded';
        }
      } catch (error) {
      }
    }
  }

  constructor(
    private router: Router
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
    this.currentTrial += 1;
    this.generateStimulus();
    this.isStimulus = true;
    this.isResponseAllowed = true;

    this.timer.started = new Date().getTime();
    this.timer.ended = 0;

    console.log(this.isPractice ? `Practice trial: ${this.currentTrial}` : `Actual trial: ${this.currentTrial}`);
    await this.wait(2000);
    this.showFeedback();
  }

  generateStimulus() {
    const random = Math.random();
    if (random < 0.5) {
      this.color = 'green';
      this.data.push({
        actualAnswer: 'responded',
        userAnswer: 'not-responded',
        responseTime: 0
      });
    } else {
      this.color = 'orange';
      this.data.push({
        actualAnswer: 'not-responded',
        userAnswer: 'not-responded',
        responseTime: 0
      });
    }
  }

  async showFeedback() {
    this.isStimulus = false;
    this.isResponseAllowed = false;

    if (this.data[this.data.length - 1].responseTime === 0) {
      this.timer.ended = new Date().getTime();
      this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
    }

    if (this.data[this.data.length - 1].actualAnswer === this.data[this.data.length - 1].userAnswer) {
      this.feedback = "Correct";
      this.scoreForSpecificTrial = 10;
      this.totalScore += 10;
    } else {
      this.feedback = "Incorrect";
      this.scoreForSpecificTrial = 0;
    }

    await this.wait(1000);
    this.decideToContinue();
  }

  async decideToContinue() {
    if (this.isPractice) {
      if (this.currentTrial < this.practiceTrials) {
        await this.wait(1000);
        this.showStimulus();
      } else {
        this.proceedtoNextStep();
        await this.wait(2000);
        this.proceedtoNextStep();
      }
    } else {
      if (this.currentTrial < this.actualTrials) {
        await this.wait(1000);
        this.showStimulus();
      } else {
        this.proceedtoNextStep();
        await this.wait(2000);
        this.proceedtoNextStep();
        console.log(this.data);
      }
    }
  }

  continueAhead() {
    this.router.navigate(['/dashboard']);
  }

  reset() {
    this.color = '';
    this.feedback = '';
    this.scoreForSpecificTrial = 0;
  }

  resetData() {
    this.data = [];
    this.totalScore = 0;
  }

  wait(time: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

}
