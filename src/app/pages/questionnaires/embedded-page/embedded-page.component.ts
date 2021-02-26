import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { interval, Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';

@Component({
  selector: 'app-embedded-page',
  templateUrl: './embedded-page.component.html',
  styleUrls: ['./embedded-page.component.scss']
})
export class EmbeddedPageComponent implements OnInit, OnDestroy {

  // Link sent in as an admin to preview the embedded survey
  @Input()
  previewLink: string = "";

  checkSurveyComplete: Observable<number> = interval(1500);

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
    if(this.adminPreviewing()) {
      const subjectID = this.authService.getDecodedToken().Email;
      this.embeddedSurveyLink = this.previewLink + subjectID;
    } else {
      this.subscriptions.push(
        this.route.params.subscribe((params: {link: string}) => {
          if(!params && !params.link) {
            this.snackbar.openErrorSnackbar("Could not find survey link. Please proceed to next step and reach out to the sharplab.")
          } else {
            const subjectID = this.authService.getDecodedToken().UserID;
            const code = this.taskManager.getExperimentCode();
            this.embeddedSurveyLink = this.parseURL(params.link, subjectID, code);
          }
        })
      )
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
