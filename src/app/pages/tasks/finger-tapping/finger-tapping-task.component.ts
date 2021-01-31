import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Key, Role, UserResponse } from 'src/app/models/InternalDTOs';
import { FingerTapping, TaskNames } from 'src/app/models/TaskData';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { TimerService } from 'src/app/services/timer.service';
import { UploadDataService } from 'src/app/services/uploadData.service';
import { environment } from 'src/environments/environment';

declare function setFullScreen(): any;

@Component({
  selector: 'app-finger-tapping-task',
  templateUrl: './finger-tapping-task.component.html',
  styleUrls: ['./finger-tapping-task.component.scss']
})
export class FingerTappingTaskComponent implements OnInit {

  isPractice: boolean = true;
  userID: string;
  isBreak: boolean = false;
  step: number = 1;
  practiceTrialDuration: number = environment.production ? 10000 : 5000;
  actualTrialDuration: number[] = environment.production ? [60000, 60000, 20000]: [10000, 10000, 5000];
  block: number = 0;
  isResponseAllowed: boolean;
  hand: string;
  showFixation: boolean = false;
  lastKey: Key = null;

  durationUntilCanContinue: number = environment.production ? 30 : 10;
  durationUntilContinueRequired: number = environment.production ? 120 : 20;

  // global timers
  blockTimer: number;       // timer to count the duration of the block
  fixationTimeout: number;  // timer to count how long the fixation shows
  breakTimer: number;       // timer to count how long the break is
  countdownTimer: number;   // timer to count down until the game starts
  
  // keeps track of number of times user has pressed a key
  pressNum: number = 0;
  data: FingerTapping[] = [];
  // fixation time out function
  time: number;
  resumeDisabled: boolean = false;
  countDownDisplayValue: number;
  dominantHand: UserResponse = UserResponse.NA;


  @HostListener('window:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.isResponseAllowed && this.isValidKey(event.key)) {
      const responseTime = this.timerService.stopTimerAndGetTime();
      const keyPressed: Key = event.key === Key.Q ? Key.Q : Key.P;

      this.data.push({
        trial: ++this.pressNum,
        userID: this.userID,
        score: null,
        submitted: this.timerService.getCurrentTimestamp(),
        isPractice: this.isPractice,
        isCorrect: (event.key !== this.lastKey),
        experimentCode: this.taskManager.getExperimentCode(),
        block: this.block,
        dominantHand: this.dominantHand,
        handUsed: this.getHandUsed(),
        timeFromLastKeyPress: responseTime,
        keyPressed: keyPressed
      });
      
      // for first press of the game lastKey will be null
      if(this.lastKey !== keyPressed) {
        this.flashFixation();
        this.lastKey = keyPressed;
      }

      this.timerService.startTimer()
    }
  }

  getHandUsed(): UserResponse {
    if(this.isPractice) {
      return UserResponse.RIGHT
    }
    switch (this.block) {
      case 1:
        return this.dominantHand;
      case 2:
        return this.dominantHand === UserResponse.RIGHT ? UserResponse.LEFT : UserResponse.RIGHT;
      case 3:
        return UserResponse.BOTH;
    }
  }

  private flashFixation() {
    this.showFixation = true;
    this.fixationTimeout = setTimeout(() => {
      this.showFixation = false;
      clearTimeout(this.fixationTimeout)
    }, 50);
  }

  private isValidKey(key: string): boolean {
    if(key === Key.Q || key === Key.P) return true;
    return false;
  }

  constructor(
    private router: Router,
    private uploadDataService: UploadDataService,
    private timerService: TimerService,
    private authService: AuthService,
    private taskManager: TaskManagerService,
    private snackbarService: SnackbarService
  ) { }


  ngOnInit() {
    const decodedToken = this.authService.getDecodedToken()
    if(!this.taskManager.hasExperiment() && decodedToken.Role !== Role.ADMIN) {
      this.router.navigate(['/login/onlineparticipant'])
      this.snackbarService.openErrorSnackbar("Refresh has occurred")
    }
    const jwt = this.authService.getDecodedToken()
    this.userID = jwt.UserID
  }



  proceedtoPreviousStep() {
    this.step -= 1;
  }



  proceedtoNextStep() {
    this.step += 1;
  }

  handleLeftOrRightHanded(handedness: string) {
    this.dominantHand = handedness as UserResponse
    this.proceedtoNextStep();
  }

  startPractice() {
    this.isPractice = true;
    this.startCountDownTimer();
  }

  // called once to set things up
  startActual() {
    this.block = 0;
    this.isPractice = false;
    this.startCountDownTimer();
  }

  startCountDownTimer() {
    this.startGameInFullScreen();
    this.proceedtoNextStep();
    this.countDownDisplayValue = 5;
    this.countdownTimer = setInterval(() => {
      this.countDownDisplayValue -= 1;
      if (this.countDownDisplayValue === 0) {
        clearInterval(this.countdownTimer);
        this.startBlock();
      }
    }, 1000);
  }


  startBlock() {
    this.reset();
    this.proceedtoNextStep();
    this.block += 1;
    this.startBlockTimer();
  }

  startBlockTimer() {
    const duration: number = this.isPractice ? this.practiceTrialDuration : this.actualTrialDuration[this.block - 1];
    this.isBreak = false;
    this.timerService.clearTimer();
    this.timerService.startTimer();
    this.isResponseAllowed = true;

    this.blockTimer = setTimeout(() => {
      this.stopBlockTimer();
    }, duration);
  }

  async stopBlockTimer() {
    this.isResponseAllowed = false;
    this.timerService.clearTimer();
    clearTimeout(this.blockTimer);
    this.proceedtoNextStep();

    // no break if practice
    if(!this.isPractice) {
      if (this.block < 3) {
        await this.wait(2000);
        this.proceedtoNextStep();
        this.isBreak = true;
        this.startBreakTimer();
      } else {
        const decodedToken = this.authService.getDecodedToken()
        if(decodedToken.Role === Role.ADMIN) {
          this.proceedtoNextStep();
        } else {

          this.uploadResults(this.data).pipe(take(1)).subscribe(ok => {
            if(ok) {
              this.proceedtoNextStep();
            } else {
              console.error("There was an error downloading results")
              this.taskManager.handleErr();
            }
          }, err => {
            console.error("There was an error downloading results")
            this.taskManager.handleErr();
          })

        }
      }
    } else {
      await this.wait(2000);
      this.proceedtoNextStep();
    }
  }

  startBreakTimer() {
    this.time = 0;
    this.resumeDisabled = true;
    this.breakTimer = setInterval(() => {
      this.time += 1;
      if (this.time === this.durationUntilCanContinue) {
        this.resumeDisabled = false;
      }
      if (this.time === this.durationUntilContinueRequired) {
        this.stopBreakTimer();
        return;
      }
    }, 1000);
  }

  reset() {
    this.pressNum = 0;
    this.lastKey = null;
  }

  stopBreakTimer() {
    clearInterval(this.breakTimer);
    this.isBreak = false;
    this.startCountDownTimer();
  }



  uploadResults(data: FingerTapping[]): Observable<boolean> {
    const experimentCode = this.taskManager.getExperimentCode()
    return this.uploadDataService.uploadData(experimentCode, TaskNames.FINGERTAPPING, data).pipe(
      map(ok => ok.ok)
    )
  }



  continueAhead() {
    const decodedToken = this.authService.getDecodedToken()
    if(decodedToken.Role === Role.ADMIN) {
      if(!environment.production) console.log(this.data)
      
      this.router.navigate(['/dashboard/tasks'])
      this.snackbarService.openInfoSnackbar("Task completed")
    } else {
      this.taskManager.nextExperiment()
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
