import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UploadDataService } from 'src/app/services/uploadData.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as practiceGrid1 from './grid.1.practice';
import * as grid1 from './grid.1';
import * as practiceGrid2 from './grid.2.practice';
import * as grid2 from './grid.2';
import { MatButton } from '@angular/material/button';

declare function setFullScreen(): any;

export class GridConfig {
  correct: any[];
  grid: {value: any}[][]
}

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
  flashIncorrectDuration: number = 500;
  numberOfBreaks: number;
  maxResponseTime: number;
  durationOfFeedback: number;
  interTrialDelay: number;
  practiceTrials: number;
  actualTrials: number;
  sTimeout;
  // can be numbers or letters
  correctItems: (number | string)[] = [];
  answerKey: (number | string)[] = [];
  gridConfig: GridConfig

  constructor(
    private router: Router,
    private uploadDataService: UploadDataService,
    private snackbar: MatSnackBar,
    private renderer: Renderer2
  ) { }

  ngOnInit() {

  }

  proceedtoPreviousStep() {
    this.step -= 1;
  }

  proceedtoNextStep() {
    this.step += 1;
  }

  // sets the button color to green if it is correct and white otherwise
  getColor(val: number | string) {
    return this.correctItems.includes(val) ? 'green' : 'whitesmoke';
  }

  registerClick(button: MatButton, value: number | string) {

    // if answer has already been recorded as correct, we do nothing
    if (this.correctItems.includes(value)) return;

    this.correctItems.push(value);
    const currIndex = this.correctItems.length - 1;

    // selected answer is incorrect
    if (this.correctItems[currIndex] !== this.answerKey[currIndex]) {
      this.correctItems.pop();
      this.flashIncorrectColor(button._elementRef, value);
    }

    // if we have filled up all the correct Items, complete the round and move on
    if (this.correctItems.length === this.answerKey.length) this.roundComplete();
  }

  private flashIncorrectColor(elRef: ElementRef, val: number | string) {

    this.changeColor(elRef, 'red');

    // case: elRef = button 2, val = 2
    // 1. user selects 2 (incorrect)
    // 2. user selects 1 immediately (correct)
    // 3. user selects 2 immediately (now correct)
    // in this case, we don't want the color to change back to white, we want to
    // keep it green so we need to check if the user happened to selected the correct
    // answer before the timeout ended
    setTimeout(() => {
      if(!this.correctItems.includes(val)) {
        this.changeColor(elRef, 'whitesmoke')
      }
    }, this.flashIncorrectDuration)
  }

  private changeColor(elRef: ElementRef, color: string) {
    this.renderer.setStyle(elRef.nativeElement, 'background-color', color);
  }

  private async roundComplete() {
    await this.wait(1000);
    this.correctItems = [];
    this.proceedtoNextStep();
  }

  async startPractice() {
    this.gridConfig = this.step >= 9 ? practiceGrid2.config : practiceGrid1.config;
    this.answerKey = this.gridConfig.correct;
    this.correctItems = [];
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
  }

  async startActual() {
    this.gridConfig = this.step >= 9 ? grid2.config : grid1.config;
    this.answerKey = this.gridConfig.correct;
    this.correctItems = [];
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
