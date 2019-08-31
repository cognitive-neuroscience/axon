import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
declare function setFullScreen(): any;

@Component({
  selector: 'app-go-nogo',
  templateUrl: './go-nogo.component.html',
  styleUrls: ['./go-nogo.component.scss']
})
export class GoNogoComponent implements OnInit {

  // Default Experiment config 
  isScored: boolean = true;
  showFeedbackAfterEveryTrial: boolean = true;
  showScoreAfterEveryTrial: boolean = true;
  numberOfBreaks: number = 0;
  maxResponseTime: number = 800;        // In milliseconds
  durationOfFeedback: number = 1000;    // In milliseconds
  interTrialDelay: number = 1000;       // In milliseconds
  practiceTrials: number = 1;
  actualTrials: number = 10;

  step: number = 1;
  color: string = '';
  feedback: string = '';
  scoreForSpecificTrial: number = 0;
  totalScore: number = 0;
  isPractice: boolean = false;
  isStimulus: boolean = false;
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
    this.isScored = currentExperiment.isScored
    this.showFeedbackAfterEveryTrial = currentExperiment.showFeedbackAfterEveryTrial
    this.showScoreAfterEveryTrial = currentExperiment.showScoreAfterEveryTrial
    this.numberOfBreaks = currentExperiment.numberOfBreaks
    this.maxResponseTime = currentExperiment.maxResponseTime
    this.durationOfFeedback = currentExperiment.durationOfFeedback
    this.interTrialDelay = currentExperiment.interTrialDelay
    this.practiceTrials = currentExperiment.practiceTrials
    this.actualTrials = currentExperiment.actualTrials
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


  /**
   * Start the practice session
   *
   * @memberof GoNogoComponent
   */
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


  /**
   * Start actual game
   *
   * @memberof GoNogoComponent
   */
  async startActualGame() {
    this.resetData();
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
    this.isPractice = false;
    this.currentTrial = 0;
    this.showStimulus();
  }


  /**
   * Show stimulus
   *
   * @memberof GoNogoComponent
   */
  async showStimulus() {
    this.reset();
    this.currentTrial += 1;
    this.generateStimulus();
    this.isStimulus = true;
    this.isResponseAllowed = true;

    this.timer.started = new Date().getTime();
    this.timer.ended = 0;

    console.log(this.isPractice ? `Practice trial: ${this.currentTrial}` : `Actual trial: ${this.currentTrial}`);

    // This is the delay between showing the stimulus and showing the feedback
    await this.wait(this.maxResponseTime);

    this.showFeedback();
  }


  /**
   * Generate target stimulus
   *
   * @memberof GoNogoComponent
   */
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


  /**
   * Show feedback
   *
   * @memberof GoNogoComponent
   */
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
      if (this.data[this.data.length - 1].actualAnswer === 'responded') {
        this.feedback = "Too slow"
      } else {
        this.feedback = "Incorrect";
      }
      this.scoreForSpecificTrial = 0;
    }

    // This is the duration for which the feedback is shown on the screen
    await this.wait(this.durationOfFeedback);

    this.decideToContinue();
  }


  /**
   * Check if trials have been finished
   *
   * @memberof GoNogoComponent
   */
  async decideToContinue() {
    if (this.isPractice) {
      if (this.currentTrial < this.practiceTrials) {

        // This is delay between end of feedback of previous trial and showing the next stimulus
        await this.wait(this.interTrialDelay);

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
   * Reset trial data
   *
   * @memberof GoNogoComponent
   */
  reset() {
    this.color = '';
    this.feedback = '';
    this.scoreForSpecificTrial = 0;
  }


  /**
   * Reset all results
   *
   * @memberof GoNogoComponent
   */
  resetData() {
    this.data = [];
    this.totalScore = 0;
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
