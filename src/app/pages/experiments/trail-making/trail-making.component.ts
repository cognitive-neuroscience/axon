import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
declare function setFullScreen(): any;

@Component({
  selector: 'app-trail-making',
  templateUrl: './trail-making.component.html',
  styleUrls: ['./trail-making.component.scss']
})
export class TrailMakingComponent implements OnInit {

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
  sTimeout;
  clicked: number[] = [];
  correct: number[] = [];
  sTimeout2;


  constructor(
    private router: Router,
    private dataService: DataService,
    private snackbar: MatSnackBar
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

  getColor(number: number) {
    return this.clicked.includes(number) ? (this.clicked[number - 1] === number ? 'green' : 'red') : 'whitesmoke';
  }

  registerClick(number: number) {
    if (!this.clicked.includes(number)) {
      this.clicked.push(number);
      if (this.clicked[this.clicked.length - 1] !== this.correct[this.clicked.length - 1]) {
        const audio = new Audio('/assets/sounds/wrong.mp3');
        audio.play();
        this.sTimeout = setTimeout(() => {
          this.clicked.pop();
        }, 500);
      } else {
        const audio = new Audio('/assets/sounds/correct.mp3');
        audio.play();
      }
      try {
        clearTimeout(this.sTimeout2);
      } catch (error) {

      }
      this.sTimeout2 = setTimeout(() => {
        if (this.clicked.length === this.correct.length) {
          this.clicked = [];
          this.proceedtoNextStep();
        }
      }, 1500);
    }
  }

  async startPractice() {
    this.clicked = [];
    this.correct = [1, 2, 3, 4, 5, 6, 7, 8];
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
  }

  async startActual() {
    this.clicked = [];
    this.correct = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
    this.sTimeout = setTimeout(() => {
      this.proceedtoNextStep();
      this.snackbar.open('Timeout', '', { duration: 2000 });
    }, 240000);
  }


  uploadResults() {
  }


  continueAhead() {
    this.router.navigate(['/dashboard']);
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
