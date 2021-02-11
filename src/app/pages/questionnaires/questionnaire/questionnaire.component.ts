import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Observable, of, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit, OnDestroy {

  checkSurveyComplete: Observable<number> = interval(1500);
  isDisabled: boolean = true;

  embeddedSurveyLink: string = "";
  subscriptions: Subscription[] = [];
  
  constructor(
    private authService: AuthService, 
    private confirmationService: ConfirmationService,
    private taskManager: TaskManagerService,
    private router: Router,
    private snackbar: SnackbarService
  ) {
    const URL = this.router.getCurrentNavigation()?.extras?.state?.questionnaireURL;
    if(!URL) {
      this.snackbar.openErrorSnackbar("There was an error getting the questionnaire. Please click 'NEXT' to continue")
    } else {
      const subjectID = this.authService.getDecodedToken().UserID;
      this.embeddedSurveyLink = URL + subjectID
    }
  }

  ngOnInit(): void {
  }


  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  proceed() {
    const msg = "Did you complete the survey? Please note that we will not be able to compensate you if you have not completed the survey.";

    this.subscriptions.push(
      this.confirmationService.openConfirmationDialog(msg).subscribe(ok => {
        if(ok) {
          this.taskManager.next();
        }
      })
    )
  }

}
