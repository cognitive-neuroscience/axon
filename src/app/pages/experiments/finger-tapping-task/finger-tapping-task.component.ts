import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

declare function setFullScreen(): any;

@Component({
  selector: 'app-finger-tapping-task',
  templateUrl: './finger-tapping-task.component.html',
  styleUrls: ['./finger-tapping-task.component.scss']
})
export class FingerTappingTaskComponent implements OnInit {

  isBreak: boolean = false;
  step: number = 1;
  isScored: number | boolean;
  showFeedbackAfterEveryTrial: number | boolean;
  showScoreAfterEveryTrial: number | boolean;
  numberOfBreaks: number;
  maxResponseTime: number;
  durationOfFeedback: number;
  interTrialDelay: number;
  practiceTrials: number;
  actualTrials: number;
  keyA: string;
  keyB: string;
  block: number = 0;
  gameOn: boolean;
  blockTimer;
  hand: string;
  showFixation: boolean = false;
  lastKey: string;
  currentTrial: number = 1;
  startTime: number;
  data: {
    trial: number,
    hand: string,
    block: number,
    key: string,
    responseTime: number
  }[] = [];
  fixationTimeout;
  time: number;
  breakTimer;
  resumeDisabled: boolean = false;
  countdownTimer;
  time2: number;


  @HostListener('window:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.gameOn) {
      if ([this.keyA, this.keyB].includes(event.key.toUpperCase())) {
        if (event.key.toUpperCase() !== this.lastKey) {
          this.showFixation = true;
          this.fixationTimeout = setTimeout(() => {
            this.showFixation = false;
          }, 50);
          this.data.push({
            trial: this.currentTrial,
            hand: this.hand,
            block: this.block,
            key: event.key.toUpperCase(),
            responseTime: new Date().getTime() - this.startTime
          });
          this.currentTrial += 1;
          this.startTime = new Date().getTime();
          this.lastKey = event.key.toUpperCase();
        }
      }
    }
  }

  /**
   * Creates an instance of GoNogoComponent
   * 
   * @param {Router} router
   * @memberof GoNogoComponent
   */
  constructor(
    private router: Router,
    private dataService: DataService
  ) { }

  /**
   * ngOnInit lifecycle hook
   *
   * @memberof GoNogoComponent
   */
  ngOnInit() {
    let route_split = this.router.url.split('/');
    let routePath = route_split[route_split.length - 1];
    let currentExperiment = this.dataService.getExperimentByRoute(routePath);
    this.isScored = currentExperiment.isScored;
    this.showFeedbackAfterEveryTrial = currentExperiment.showFeedbackAfterEveryTrial;
    this.showScoreAfterEveryTrial = currentExperiment.showScoreAfterEveryTrial;
    this.numberOfBreaks = currentExperiment.numberOfBreaks;
    this.maxResponseTime = currentExperiment.maxResponseTime;
    this.durationOfFeedback = currentExperiment.durationOfFeedback;
    this.interTrialDelay = currentExperiment.interTrialDelay;
    this.practiceTrials = currentExperiment.practiceTrials;
    this.actualTrials = currentExperiment.actualTrials;
    if (Math.random() > 0.5) {
      this.keyA = 'Q';
      this.keyB = 'P';
    } else {
      this.keyA = '1';
      this.keyB = '-';
    }
    this.lastKey = this.keyB;
    this.hand = Math.random() > 0.5 ? 'L' : 'R';
  }


  /**
   * Process consent
   *
   * @param {Boolean} consent
   * @memberof GoNogoComponent
   */
  processConsent(consent: Boolean) {
    if (consent) {
      this.proceedtoNextStep();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }


  /**
   * Go back to previous step
   *
   * @memberof GoNogoComponent
   */
  proceedtoPreviousStep() {
    this.step -= 1;
  }


  /**
   * Proceed to next step
   *
   * @memberof GoNogoComponent
   */
  proceedtoNextStep() {
    this.step += 1;
  }

  startCountDownTimer() {
    this.startGameInFullScreen();
    this.proceedtoNextStep();
    this.time2 = 5;
    this.countdownTimer = setInterval(() => {
      this.time2 -= 1;
      if (this.time2 === 0) {
        try {
          clearInterval(this.countdownTimer);
        } catch (error) {

        }
        this.startBlock();
      }
    }, 1000);
  }


  startBlock() {
    this.lastKey = this.keyB;
    this.proceedtoNextStep();
    this.block += 1;
    this.startBlockTimer();
  }

  startBlockTimer() {
    this.isBreak = false;
    this.gameOn = true;
    this.startTime = new Date().getTime();
    this.blockTimer = setTimeout(() => {
      this.stopBlockTimer();
    }, 60000);
  }

  async stopBlockTimer() {
    this.gameOn = false;
    try {
      clearTimeout(this.blockTimer);
    } catch (error) {

    }
    this.isBreak = true;
    this.proceedtoNextStep();
    if (this.block < 6) {
      this.startBreakTimer();
      this.hand = this.hand === 'L' ? 'R' : 'L';
    } else {
      this.isBreak = false;
      this.proceedtoNextStep();
      await this.wait(2000);
      this.proceedtoNextStep();
      console.log(this.data);
    }
  }

  startBreakTimer() {
    this.time = 0;
    this.resumeDisabled = true;
    this.breakTimer = setInterval(() => {
      this.time += 1;
      if (this.time === 30) {
        this.resumeDisabled = false;
      }
      if (this.time === 120) {
        try {
          clearInterval(this.breakTimer);
        } catch (error) {

        }
        this.isBreak = false;
        this.proceedtoNextStep();
      }
    }, 1000);
  }

  stopBreakTimer() {
    try {
      clearInterval(this.breakTimer);
    } catch (error) {

    }
    this.isBreak = false;
    this.proceedtoNextStep();
  }


  /**
   * Upload results
   *
   * @memberof GoNogoComponent
   */
  uploadResults() {
  }


  /**
   * Go to dashboard or next experiment
   *
   * @memberof GoNogoComponent
   */
  continueAhead() {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Start fullscreen
   *
   * @memberof GoNogoComponent
   */
  startGameInFullScreen() {
    setFullScreen();
  }


  /**
   * Delay function
   *
   * @param {number} time
   * @returns {Promise<void>}
   * @memberof GoNogoComponent
   */
  wait(time: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

}
