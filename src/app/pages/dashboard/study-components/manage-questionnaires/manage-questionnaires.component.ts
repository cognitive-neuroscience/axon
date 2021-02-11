import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Questionnaire } from 'src/app/models/Questionnaire';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { QuestionnaireService } from 'src/app/services/questionnaire.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CreateQuestionnaireDialogComponent } from './create-questionnaire-dialog/create-questionnaire-dialog.component';

@Component({
  selector: 'app-manage-questionnaires',
  templateUrl: './manage-questionnaires.component.html',
  styleUrls: ['./manage-questionnaires.component.scss']
})
export class ManageQuestionnairesComponent implements OnInit {


  constructor(
    private questionnaireService: QuestionnaireService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private confirmationService: ConfirmationService
  ) { }

  questionnaires: Observable<Questionnaire[]>;

  subscriptions: Subscription[] = [];

  displayedColumnsForGuests = ['name', 'description', 'url', 'action'];

  ngOnInit(): void {
    this.questionnaires = this.questionnaireService.questionnaires;
    this.questionnaireService.updateQuestionnaires();
  }

  openCreateQuestionnaireModal() {
    const dialogRef = this.dialog.open(CreateQuestionnaireDialogComponent, {width: "30%"})
    this.subscriptions.push(
      dialogRef.afterClosed().subscribe((data: Questionnaire) => {  
        if(data) this._createQuestionnaire(data);
      })
    )
  }

  private _createQuestionnaire(questionnaire: Questionnaire) {
    this.questionnaireService.createQuestionnaire(questionnaire).subscribe((data) => {
      this.questionnaireService.updateQuestionnaires();
      this.snackbarService.openSuccessSnackbar("Successfully created new questionnaire");
    }, (err: HttpErrorResponse) => {
      let errMsg = err.error?.message;
      if(!errMsg) {
        errMsg = "Could not create guest"
      }
      this.snackbarService.openErrorSnackbar(err.error?.message)
    })
  }

  deleteQuestionnaire(questionnaire: Questionnaire) {
    this.confirmationService.openConfirmationDialog("Are you sure you want to delete the questionnaire: " + questionnaire.name + "?").pipe(
      mergeMap(ok => {
        if(ok) {
          return this.questionnaireService.deleteQuestionnaireByID(questionnaire.questionnaireID);
        }
      })
    ).subscribe(data => {
      this.questionnaireService.updateQuestionnaires();
      this.snackbarService.openSuccessSnackbar("Successfully deleted " + questionnaire.name);
    }, err => {
      console.error(err)
      this.snackbarService.openErrorSnackbar("There was an error deleting the user")
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

}