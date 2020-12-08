import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
declare function setFullScreen(): any;
import { BlockSet, Block, DScounterbalance } from './BlockSet';
import { UploadDataService } from 'src/app/services/uploadData.service';
import { Color, Key, Role, UserResponse } from 'src/app/models/InternalDTOs';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { TaskManagerService } from '../../../services/task-manager.service';

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
  // numberOfBreaks: number = 0;
  maxResponseTime: number = 4000;
  durationOfFeedback: number = 1000;    // In milliseconds
  interTrialDelay: number = 200;       // In milliseconds
  practiceTrials: number = 5;
  actualTrials: number = 50;
  blockTrials: number[] = [2, 2, 2, 2, 5, 5]

  // all variables relating to showing different component in the game
  showPatches: boolean = false;
  showNumber: boolean = false;
  number: number = 0;
  feedback: string = '';
  showFixation: boolean = false;
  feedbackShown: boolean = false;
  
  scoreForSpecificTrial: number = 0;
  step: number = 1;
  totalScore: number = 0;
  isPractice: boolean = false;
  isStimulus: boolean = false;
  isBreak: boolean = false;
  currentTrial: number = 0; // keeps track of what trial num we're currently at for the specific block
  isResponseAllowed: boolean = false;
  data: {
    patchImgSelected: string,
    patchImgNotSelected: string,
    color: string,
    digit: number,
    actualAnswer: string,
    userAnswer: string,
    counterbalance: string,
    responseTime: number,
    isCorrect: boolean,
    block: number,
    score: number,
  }[] = [];
  sTimeout: any;

  // what practice phase we are currently at
  currentPracticeRound: {
    phase: number,
    round: number // multiple rounds for each phase (each repeat is +1 round)
  } = {
    phase: 0,
    round: 0
  }

  public readonly imagePath = "/assets/images/stimuli/demandselection/"

  // config for setting up practice rounds
  practiceRoundConfig: {
    [key: number]: {
      numTrials: number, 
      showFeedback: boolean, 
      responseTime: number, // in milliseconds
      repeat: {
        canRepeat: boolean, 
        numRepeatsAllowed: number,
        thresholdForRepeat?: number
      }
    }
  } = {
    1: {
      numTrials: 1,
      showFeedback: true,
      responseTime: 4000,
      repeat: {
        canRepeat: false,
        numRepeatsAllowed: 0
      }
    },
    2: {
      numTrials: 1,
      showFeedback: true,
      responseTime: 4000,
      repeat: {
        canRepeat: false,
        numRepeatsAllowed: 0,
      }
    }
  }

  timer: {
    started: number,
    ended: number
  } = {
      started: 0,
      ended: 0
    };

  

  selectedPatch: "firstPatch" | "secondPatch" = "firstPatch";
  color: string;
  blockset: BlockSet;
  currentBlock: Block;
  blockNum = 1;
  counterBalance: DScounterbalance = DScounterbalance.NONE; // for blocks 5 & 6

  oddEvenColor = Color.BLUE;
  ltGtColor = Color.ORANGE;

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.isResponseAllowed && this.isValidKey(event.key)) {
      // if we have a response before timeout, we need to make sure this is cleared
      clearTimeout(this.sTimeout)
      this.isStimulus = false;
      this.showPatches = false;
      this.showFixation = false;
      this.showNumber = false;
      this.isResponseAllowed = false;
      let userAnswer: UserResponse;

      this.timer.ended = new Date().getTime();
      this.data[this.data.length - 1].responseTime = this.timer.ended - this.timer.started;

      // mark down user response
      const selectedColor = this.currentBlock.trialConfigs[this.currentTrial - 1][this.selectedPatch];
      if(selectedColor === this.oddEvenColor) {
        userAnswer = event.key === Key.ARROWLEFT ? UserResponse.ODD : UserResponse.EVEN
      } else {
        userAnswer = event.key === Key.ARROWLEFT ? UserResponse.LESSER : UserResponse.GREATER
      }

      this.data[this.data.length - 1].userAnswer = userAnswer;

      this.showFeedback();
    }
  }

  private isValidKey(key: string): boolean {
    if(key === Key.ARROWLEFT || key === Key.ARROWRIGHT) return true;
    return false;
  }

  constructor(
    private router: Router,
    private uploadDataService: UploadDataService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private taskManager: TaskManagerService
  ) { }

  ngOnInit() {
    // generate the blockset for the 6 blocks to be run
    this.blockset = new BlockSet(this.blockTrials, 10, 90, Color.BLUE, Color.ORANGE, false);
    console.log(this.blockset);
    
  }

  proceedtoPreviousStep(step = 1) {
    this.step -= step;
  }

  proceedtoNextStep() {
    this.step += 1;
  }

  async startPractice() {

    this.applyPracticeTrialConfigs()

    let blockset = new BlockSet([this.practiceTrials], 10, 90, Color.BLUE, Color.ORANGE, true);
    console.log(blockset);
    
    this.currentBlock = blockset.blocks[0];

    // this.startGameInFullScreen();
    this.resetData();
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
    this.isPractice = true;
    this.currentTrial = 0;
    this.showStimulus();
  }

  // looks at the practice trial config and applies the number of practice trials, feedback shown, as well as
  // whether the phase needs to be repeated or not
  private applyPracticeTrialConfigs() {

    if(this.currentPracticeRound.round == 0 || !this.shouldRepeatPracticePhase()) {
      // if we are at the first round of the phase, we don't worry about repeating
      // we should not go to the next phase if we need to repeat
      this.currentPracticeRound.phase++;
      this.currentPracticeRound.round = 0;
    }

    const phase = this.currentPracticeRound.phase;
    this.practiceTrials = this.practiceRoundConfig[phase].numTrials;
    this.maxResponseTime = this.practiceRoundConfig[phase].responseTime;
    this.showFeedbackAfterEveryTrial = this.practiceRoundConfig[phase].showFeedback;
    this.currentPracticeRound.round++;
  }

  private shouldRepeatPracticePhase(): boolean {
    const phase = this.currentPracticeRound.phase;
    const round = this.currentPracticeRound.round;
    const repeatConfig = this.practiceRoundConfig[phase].repeat;
    const threshold = repeatConfig.thresholdForRepeat ? repeatConfig.thresholdForRepeat : 1.01

    // if canRepeat = true, we haven't reached our max repeat limit, 
    // and the participant did worse than the given threshold then we repeat
    if( repeatConfig.canRepeat && 
        round <= repeatConfig.numRepeatsAllowed && 
        this.getPercentageCorrect() < threshold
     ) {
      return true;
    }
    return false;
  }

  private getPercentageCorrect(): number {
    // divide by 0 guard
    if(this.practiceTrials == 0) return 0;
    return (this.totalScore / 10) / this.practiceTrials;
  }

  async prepareActualGame() {
    this.resetData();
    this.currentBlock = this.blockset.blocks[0];
    this.proceedtoNextStep()
  }

  async startBlock() {
    this.proceedtoNextStep();
    await this.wait(2000);
    this.proceedtoNextStep();
    this.isPractice = false;
    this.showFeedbackAfterEveryTrial = false;
    this.maxResponseTime = 4000;
    this.showScoreAfterEveryTrial = false;
    this.actualTrials = this.currentBlock.trialConfigs.length;
    this.currentTrial = 0;
    this.showStimulus();
  }

  // 1) show the bullseye
  showStimulus() {
    this.reset();
    this.showFixation = true;
    this.showNumber = false;
    this.showPatches = false;
    this.currentTrial += 1;
    this.isStimulus = true;
  }

  // 2) mouse hovers over the bullseye so we hide it and show the patches
  onHoverFixation(event) {
    this.showFixation = false;
    this.showPatches = true;
    this.showNumber = false;
    this.isResponseAllowed = false;
    this.timer.started = 0;
    this.timer.ended = 0;
  }

  // 3) mouse hovers over a patch so we show the numbers and accept responses
  onHoverPatch(event, patch: "firstPatch" | "secondPatch") {
    let answer = '';
    const currentTrial = this.currentBlock.trialConfigs[this.currentTrial - 1];
    const blockConfig = this.currentBlock.blockConfig;
    const color = patch === "firstPatch" ? currentTrial.firstPatch : currentTrial.secondPatch;
    const digit = currentTrial.digit;

    if (color === this.oddEvenColor) {
      if (digit % 2 === 0) {
        answer = UserResponse.EVEN;
      } else {
        answer = UserResponse.ODD;
      }
    } else {
      if (digit > 5) {
        answer = UserResponse.GREATER;
      } else {
        answer = UserResponse.LESSER;
      }
    }

    this.selectedPatch = patch;
    this.number = digit;
    this.color = color;

    this.data.push({
      patchImgSelected: patch === "firstPatch" ? blockConfig.firstPatchImg : blockConfig.secondPatchImg,
      patchImgNotSelected: patch === "firstPatch" ? blockConfig.secondPatchImg : blockConfig.firstPatchImg,
      color: this.color,
      digit: digit,
      actualAnswer: answer,
      userAnswer: null,
      block: this.blockNum,
      responseTime: 0,
      isCorrect: false,
      counterbalance: this.counterBalance,
      score: 0,
    });

    this.showPatches = false;
    this.showFixation = false;
    this.showNumber = true;
    this.isResponseAllowed = true;

    this.timer.started = new Date().getTime();
    this.timer.ended = 0;

    // Give participant max time to respond to stimuli
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

    const currentDataObj = this.data[this.data.length - 1];

    switch (currentDataObj.userAnswer) {
      case currentDataObj.actualAnswer:   // correct
        this.feedback = "Correct";
        currentDataObj.isCorrect = true;
        currentDataObj.score = 10;
        this.scoreForSpecificTrial = 10;
        this.totalScore += 10;
        break;
      case null:                          // too slow
        this.feedback = "Too slow";
        currentDataObj.responseTime = this.maxResponseTime;
        break;
      default:                            // incorrect
        this.feedback = "Incorrect";
        currentDataObj.isCorrect = false;
        this.scoreForSpecificTrial = 0;
        break;
    }

    // we want to show 'Too slow' every time
    if (this.feedback === 'Too slow' || this.showFeedbackAfterEveryTrial) {
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
        this.continueGame();

        // Implement later if we decide to include breaks
        // if (this.numberOfBreaks === 0) {
        //   this.continueGame();
        // } else {
        //   const breakAtTrailIndices = [];
        //   const setSize = this.actualTrials / (this.numberOfBreaks + 1);
        //   for (let i = 1; i < this.numberOfBreaks + 1; i++) {
        //     breakAtTrailIndices.push(setSize * i);
        //   }
        //   if (breakAtTrailIndices.includes(this.currentTrial)) {
        //     this.isBreak = true;
        //   } else {
        //     this.isBreak = false;
        //     this.continueGame();
        //   }
        // }
      } else {

        if(this.blockNum == 6) {
          this.uploadResults()
        }


        this.proceedtoNextStep();
        await this.wait(2000);
        this.proceedtoNextStep();
      }
    }
  }

  handleNextRound() {
    this.blockNum++;
    // set the curent block to be the next one
    this.currentBlock = this.blockset.blocks[this.blockNum - 1];
    this.counterBalance = this.currentBlock.blockConfig.counterbalance;
    this.blockNum >= 5 || this.blockNum == 2 ? this.proceedtoNextStep() : this.proceedtoPreviousStep(5)
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
      console.log(this.data);
      let d = JSON.parse(JSON.stringify(this.data));
      // this.dataService.uploadData('dst', d);
    }
  }

  continueAhead() {
    const decodedToken = this.authService.getDecodedToken()
    if(decodedToken.Role === Role.ADMIN) {
      this.router.navigate(['/dashboard/tasks'])
      this.snackbarService.openInfoSnackbar("Task completed")
    } else {
      this.taskManager.nextExperiment()
    }
  }

  reset() {
    this.number = 0;
    this.feedback = '';
    this.feedbackShown = false;
    this.scoreForSpecificTrial = 0;
    this.showPatches = false;
    this.showFixation = false;
    this.showNumber = false;
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
