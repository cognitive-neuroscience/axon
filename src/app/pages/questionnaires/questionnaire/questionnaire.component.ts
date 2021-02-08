import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Observable, of, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit, OnDestroy {

  checkSurveyComplete: Observable<number> = interval(1500);

  subscriptions: Subscription[] = [];
  constructor(
    private authService: AuthService, 
    private confirmationService: ConfirmationService,
    private taskManager: TaskManagerService
  ) { }
  embeddedSurveyLink: string = "";
  isNextDisabled = false;

  ngOnInit(): void {
    const subjectID = this.authService.getDecodedToken().UserID;

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
