// import { Component, OnInit, HostListener } from '@angular/core';
// import { Router } from '@angular/router';
// import { UploadDataService } from 'src/app/services/uploadData.service';
// import { Matrix } from './matrix';
// declare function setFullScreen(): any;

// @Component({
//   selector: 'app-simon-task-prelim',
//   templateUrl: './simon-task-prelim.component.html',
//   styleUrls: ['./simon-task-prelim.component.scss']
// })
// export class SimonTaskPrelimComponent implements OnInit {

//   // Default study config
//   isScored: boolean | number = true;
//   showFeedbackAfterEveryTrial: boolean | number = true;
//   showScoreAfterEveryTrial: boolean | number = true;
//   numberOfBreaks: number = 2;
//   maxResponseTime: number = 800;        // In milliseconds
//   durationOfFeedback: number = 500;    // In milliseconds
//   interTrialDelay: number = 1000;       // In milliseconds
//   practiceTrials: number = 10;
//   actualTrials: number = 30;

//   step: number = 1;
//   color_a: string = '';
//   color_b: string = '';
//   feedback: string = '';
//   scoreForSpecificTrial: number = 0;
//   totalScore: number = 0;
//   isPractice: boolean = false;
//   isStimulus: boolean = false;
//   isBreak: boolean = false;
//   currentTrial: number = 0;
//   isResponseAllowed: boolean = false;
//   data: {
//     actualAnswer: string,
//     position: string,
//     compatible: boolean,
//     userAnswer: string,
//     responseTime: number,
//     isCorrect: number,
//     score: number
//   }[] = [];
//   timer: {
//     started: number,
//     ended: number
//   } = {
//       started: 0,
//       ended: 0
//     };
//   showFixation: boolean = false;
//   sTimeout: any;
//   feedbackShown: boolean = false;
//   matrix = new Matrix();

//   @HostListener('window:keypress', ['$event'])
//   onKeyPress(event: KeyboardEvent) {
//     if (this.isResponseAllowed) {
//       this.isResponseAllowed = false;
//       try {
//         if (event.key === 'Z' || event.key === 'z') {
//           this.timer.ended = new Date().getTime();
//           this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
//           this.data[this.data.length - 1].userAnswer = 'Z';
//           try {
//             clearTimeout(this.sTimeout);
//             this.showFeedback();
//           } catch (error) {
//           }
//         } else if (event.key === 'M' || event.key === 'm') {
//           this.timer.ended = new Date().getTime();
//           this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
//           this.data[this.data.length - 1].userAnswer = 'M';
//           try {
//             clearTimeout(this.sTimeout);
//             this.showFeedback();
//           } catch (error) {
//           }
//         } else {
//           this.timer.ended = new Date().getTime();
//           this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
//           this.data[this.data.length - 1].userAnswer = 'INVALID';
//           try {
//             clearTimeout(this.sTimeout);
//             this.showFeedback();
//           } catch (error) {
//           }
//         }
//       } catch (error) {
//       }
//     }
//   }

//   constructor(
//     private router: Router,
//     private uploadDataService: UploadDataService
//   ) { }

//   ngOnInit() {
//   }

//   processConsent(consent: Boolean) {
//     if (consent) {
//       this.proceedtoNextStep();
//     } else {
//       this.router.navigate(['/dashboard']);
//     }
//   }

//   proceedtoPreviousStep() {
//     this.step -= 1;
//   }

//   proceedtoNextStep() {
//     this.step += 1;
//   }

//   async startPractice() {
//     this.startGameInFullScreen();
//     this.resetData();
//     this.proceedtoNextStep();
//     await this.wait(2000);
//     this.proceedtoNextStep();
//     this.isPractice = true;
//     this.currentTrial = 0;
//     this.showStimulus();
//   }

//   async startActualGame() {
//     this.resetData();
//     this.proceedtoNextStep();
//     await this.wait(2000);
//     this.proceedtoNextStep();
//     this.isPractice = false;
//     this.currentTrial = 0;
//     this.showStimulus();
//   }

//   async showStimulus() {

//     this.reset();
//     this.showFixation = true;
//     await this.wait(500);
//     this.showFixation = false;
//     await this.wait(200);

//     this.currentTrial += 1;
//     this.generateStimulus();
//     this.isStimulus = true;
//     this.isResponseAllowed = true;

//     this.timer.started = new Date().getTime();
//     this.timer.ended = 0;

//     console.log(this.isPractice ? `Practice trial: ${this.currentTrial}` : `Actual trial: ${this.currentTrial}`);

//     // This is the delay between showing the stimulus and showing the feedback
//     this.sTimeout = setTimeout(() => {
//       if (!this.feedbackShown) {
//         this.showFeedback();
//       }
//     }, this.maxResponseTime);
//   }

//   generateStimulus() {
//     const random = this.matrix.stim[this.currentTrial - 1];
//     const random2 = this.matrix.pos[this.currentTrial - 1];

//     let color = 'green';
//     if (random === 1) {
//       color = 'green';
//     } else {
//       color = 'orange';
//     }

//     if (random2 === 1) {
//       this.color_a = color;
//       this.color_b = 'transparent';
//     } else {
//       this.color_b = color;
//       this.color_a = 'transparent';
//     }

//     this.data.push({
//       actualAnswer: color === 'green' ? 'Z' : 'M',
//       position: random2 === 1 ? 'LEFT' : 'RIGHT',
//       compatible: ((random2 === 1) && (color === 'green')) || ((random2 === 2) && (color === 'orange')),
//       userAnswer: '',
//       responseTime: 0,
//       isCorrect: 0,
//       score: 0
//     });

//   }

//   async showFeedback() {
//     this.feedbackShown = true;
//     this.isStimulus = false;
//     this.isResponseAllowed = false;

//     if (this.data[this.data.length - 1].responseTime === 0) {
//       this.timer.ended = new Date().getTime();
//       this.data[this.data.length - 1].responseTime = Number(((this.timer.ended - this.timer.started) / 1000).toFixed(2));
//     }

//     if (this.data[this.data.length - 1].actualAnswer === this.data[this.data.length - 1].userAnswer) {
//       this.feedback = "Correct";
//       this.data[this.data.length - 1].isCorrect = 1;
//       this.data[this.data.length - 1].score = 10;
//       this.scoreForSpecificTrial = 10;
//       this.totalScore += 10;
//     } else {
//       if (this.data[this.data.length - 1].userAnswer === '') {
//         this.feedback = "Too slow";
//       } else {
//         this.feedback = "Incorrect";
//       }
//       this.data[this.data.length - 1].isCorrect = 0;
//       this.data[this.data.length - 1].score = 0;
//       this.scoreForSpecificTrial = 0;
//     }

//     if (this.showFeedbackAfterEveryTrial || this.isPractice) {
//       await this.wait(this.durationOfFeedback);
//     }
//     this.decideToContinue();
//   }

//   async decideToContinue() {
//     if (this.isPractice) {
//       if (this.currentTrial < this.practiceTrials) {
//         this.continueGame();
//       } else {
//         this.proceedtoNextStep();
//         await this.wait(2000);
//         this.proceedtoNextStep();
//       }
//     } else {
//       if (this.currentTrial < this.actualTrials) {
//         if (this.numberOfBreaks === 0) {
//           this.continueGame();
//         } else {
//           const breakAtTrailIndices = [];
//           const setSize = this.actualTrials / (this.numberOfBreaks + 1);
//           for (let i = 1; i < this.numberOfBreaks + 1; i++) {
//             breakAtTrailIndices.push(setSize * i);
//           }
//           if (breakAtTrailIndices.includes(this.currentTrial)) {
//             this.isBreak = true;
//           } else {
//             this.isBreak = false;
//             this.continueGame();
//           }
//         }
//       } else {
//         this.proceedtoNextStep();
//         await this.wait(2000);
//         this.proceedtoNextStep();
//         console.log(this.data);
//       }
//     }
//   }

//   resume() {
//     this.reset();
//     this.isBreak = false;
//     this.continueGame();
//   }

//   async continueGame() {
//     await this.wait(this.interTrialDelay);
//     this.showStimulus();
//   }

//   uploadResults() {
//   }

//   continueAhead() {
//     this.router.navigate(['/dashboard']);
//   }

//   reset() {
//     this.color_a = '';
//     this.color_b = '';
//     this.feedback = '';
//     this.feedbackShown = false;
//     this.scoreForSpecificTrial = 0;
//   }

//   resetData() {
//     this.data = [];
//     this.totalScore = 0;
//   }

//   startGameInFullScreen() {
//     setFullScreen();
//   }

//   wait(time: number): Promise<void> {
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         resolve();
//       }, time);
//     });
//   }

// }
