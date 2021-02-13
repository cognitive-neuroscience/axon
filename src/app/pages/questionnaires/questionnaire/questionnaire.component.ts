import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
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

  // Link sent in as an admin to preview the embedded survey
  @Input()
  previewLink: string = "";

  checkSurveyComplete: Observable<number> = interval(1500);
  isDisabled: boolean = true;

  embeddedSurveyLink: string = "";
  subscriptions: Subscription[] = [];
  
  constructor(
    private authService: AuthService, 
    private confirmationService: ConfirmationService,
    private taskManager: TaskManagerService,
    private route: ActivatedRoute,
    private snackbar: SnackbarService
  ) {
  }

  ngOnInit(): void {
    if(this.authService.isAdmin() && this.previewLink) {
      const subjectID = this.authService.getDecodedToken().Email;
      this.embeddedSurveyLink = this.previewLink + subjectID;
    } else {
      this.subscriptions.push(
        this.route.params.subscribe((params: {link: string}) => {
          if(!params && !params.link) {
            this.snackbar.openErrorSnackbar("Could not find survey link. Please proceed to next step and reach out to the sharplab.")
          } else {
            const URL = params.link
            const subjectID = this.authService.getDecodedToken().UserID;
            this.embeddedSurveyLink = URL + subjectID
          }
        })
      )
    }
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
