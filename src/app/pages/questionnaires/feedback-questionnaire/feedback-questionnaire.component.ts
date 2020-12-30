import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { FeedbackQuestionnaireResponse } from '../../../models/Questionnaire';
import { AuthService } from '../../../services/auth.service';
import { TaskManagerService } from '../../../services/task-manager.service';
import { take } from 'rxjs/operators';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-feedback-questionnaire',
  templateUrl: './feedback-questionnaire.component.html',
  styleUrls: ['./feedback-questionnaire.component.scss'],
})
export class FeedbackQuestionnaireComponent implements OnInit {

  formSubmitted: boolean = false;
  touched: boolean = false;

  issuesEncountered: string = "";
  additionalFeedback: string = "";
  browser: string = "";
  browserPlaceholder: string = "Chrome, Safari, Opera, Internet Explorer, etc";

  onChange() {
    this.touched = true;

    this.browser !== "" ? this.hidePlaceholder() : this.showPlaceholder()
  }

  showPlaceholder() {
    this.browserPlaceholder = "Chrome, Safari, Opera, Internet Explorer, etc";
  }

  hidePlaceholder() {
    this.browserPlaceholder = "";
  }

  constructor(
    private questionnaireService: QuestionnaireService, 
    private authService: AuthService,
    private taskManager: TaskManagerService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
  }

  submitForm() {
    // submit if neither is empty
    if(this.issuesEncountered != "" || this.additionalFeedback != "" || this.browser != "") {
      this.saveResponse()
    }

  }

  saveResponse() {
    const userID = this.authService.getDecodedToken().UserID
    const experimentCode = this.taskManager.getExperimentCode()

    const obj: FeedbackQuestionnaireResponse = {
      userID: userID,
      experimentCode: experimentCode,
      issuesEncountered: this.issuesEncountered,
      additionalFeedback: this.additionalFeedback,
      browser: this.browser
    }
    console.log(obj);
    
    this.questionnaireService.saveFeedQuestionnaireResponse(obj).pipe(take(1)).subscribe((ok) => {
      if(ok) {
        this.formSubmitted = true;
      } else {
        this.snackbarService.openErrorSnackbar("There was an error submitting feedback")
      }
    })
  }

  

}
