import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { EmbeddedPageData, TaskType } from 'src/app/models/InternalDTOs';
import { Questionnaire } from 'src/app/models/Questionnaire';
import { CustomTask } from 'src/app/models/TaskData';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { CustomTaskService } from 'src/app/services/custom-task.service';
import { QuestionnaireService } from 'src/app/services/questionnaire.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';

@Component({
  selector: 'app-embedded-page',
  templateUrl: './embedded-page.component.html',
  styleUrls: ['./embedded-page.component.scss']
})
export class EmbeddedPageComponent implements OnInit, OnDestroy {

  @ViewChild('iframe') iframe: ElementRef;

  // Link sent in as an admin to preview the embedded survey
  @Input()
  previewLink: string = "";

  embeddedSurveyLink: string = "";
  subscriptions: Subscription[] = [];
  
  constructor(
    private authService: AuthService, 
    private confirmationService: ConfirmationService,
    private taskManager: TaskManagerService,
    private snackbar: SnackbarService,
    private questionnaireService: QuestionnaireService,
    private customTaskService: CustomTaskService,
    private _router: Router
  ) {
    // bandaid fix. Must improve this later
    const params = this._router.getCurrentNavigation()?.extras.state as EmbeddedPageData;
    if(params) {
      this.subscriptions.push(
        this.getLink(params).pipe(take(1)).subscribe(data => {
          if(!data || !data.url) {
            this.snackbar.openErrorSnackbar("Could not find page. Please proceed to the next step and contact the sharp lab.")
            return;
          }
          const subjectID = this.authService.getDecodedToken().UserID;
          const code = this.taskManager.getExperimentCode();
          this.embeddedSurveyLink = this.parseURL(data.url, subjectID, code);
        })
      )
    }
  }

  getLink(params: EmbeddedPageData): Observable<Questionnaire | CustomTask> {
    switch (params.taskType) {
      case TaskType.Questionnaire:
        return this.questionnaireService.getQuestionnaireByID(params.ID);
      case TaskType.CustomTask:
        return this.customTaskService.getCustomTaskByID(params.ID);
      default:
        // should never reach here
        return of(null)
    }
  }

  ngOnInit(): void {
    if(this.adminPreviewing()) {
      const subjectID = this.authService.getDecodedToken().Email;
      this.embeddedSurveyLink = this.parseURL(this.previewLink, subjectID, "NOTAPPLICABLE")
    }
  }

  private parseURL(url: string, subjectID: string, experimentCode: string): string {
    // we expect a url like https://www.surveymonkey.com/r/ABCDEFG?s=[s_value]&e=[e_value] OR
    // https://run.pavlovia.org/Sharp_lab/corsi-test/html?subject=[s_value]&experimentCode=[e_value]
    const sVal = "[s_value]";
    const eVal = "[e_value]";

    return (`${url.replace(sVal, subjectID)}`).replace(eVal, experimentCode);
  }

  adminPreviewing(): boolean {
    return this.authService.isAdmin() && !!this.previewLink;
  }


  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  proceed() {
    const msg = "Did you finish? Please note that we will not be able to compensate you if you have not completed the given activity.";

    this.subscriptions.push(
      this.confirmationService.openConfirmationDialog(msg).subscribe(ok => {
        if (ok) {
          this.taskManager.next();
          return;
        } else {
          this.refocusIframe();
        }
      })
    )
  }

  // iframe loses focus if the user clicks outside of it, and clicking back in it does not help
  refocusIframe() {
    if (this.iframe && this.iframe.nativeElement) this.iframe.nativeElement.focus();
  }

}
