import { Component, OnDestroy, OnInit } from '@angular/core';
import { Experiment } from '../../../models/Experiment';
import { ExperimentsService } from '../../../services/experiments.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateStudiesDialogComponent } from './create-studies-dialog/create-studies-dialog.component';
import { HttpResponse } from '@angular/common/http';
import { ConfirmationService } from '../../../services/confirmation.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';
import { mapTaskIdToTitle } from '../../../models/TaskData';
import { AuthService } from '../../../services/auth.service';
import { Questionnaire } from 'src/app/models/Questionnaire';
import { isSurveyMonkeyQuestionnaire } from 'src/app/common/commonMethods';

@Component({
  selector: 'app-view-studies',
  templateUrl: './view-studies.component.html',
  styleUrls: ['./view-studies.component.scss']
})
export class ViewStudiesComponent implements OnInit, OnDestroy {

  LINK: string = environment.production ? "https://psharplab.campus.mcgill.ca/#/login/onlineparticipant?code=" : "http://localhost:4200/#/login/onlineparticipant?code="

  subscriptions: Subscription[] = []

  constructor(
    private experimentsService: ExperimentsService,
    public dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private snackbarService: SnackbarService,
    private authService: AuthService
  ) { }

  experiments: Observable<Experiment[]>;

  taskToTitle(task: string[], questionnaires: Questionnaire[]): string[] {
    return task.map(t => {
      // embedded survey monkey questionnaire
      if(isSurveyMonkeyQuestionnaire(t)) {
        const ID = t.split("-")[1];
        // non strict equals for "1" == 1
        return questionnaires.find(q => q.questionnaireID == ID)?.name;
      } else {
        return mapTaskIdToTitle(t);
      }
    })
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.experiments = this.experimentsService.experiments.pipe(
      map(x => x?.filter(experiment => !experiment.deleted))
    )
    this.updateExperiments()
  }

  openCreateExperimentDialog() {
    const dialogRef = this.dialog.open(CreateStudiesDialogComponent, {width: "30%"})
    this.subscriptions.push(
      dialogRef.afterClosed().subscribe((data: Experiment) => {      
        if(data) this._createExperiment(data);
      })
    )
  }

  private updateExperiments() {
    this.experimentsService.update()
  }

  private _createExperiment(experiment: Experiment) {
    this.subscriptions.push(
      this.experimentsService.createExperiment(experiment).subscribe(() => this.updateExperiments())
    )
  }

  onDelete(code: string) {
    this.subscriptions.push(
      this.confirmationService.openConfirmationDialog(`Are you sure you want to delete experiment ${code}?`).subscribe(ok => {
        if(ok) this.deleteExperiment(code)
      })
    )
  }

  private deleteExperiment(code: string) {
    this.subscriptions.push(
      this.experimentsService.deleteExperiment(code).subscribe((data: HttpResponse<any>) => {
        this.updateExperiments();
        this.snackbarService.openSuccessSnackbar(`Successfully deleted experiment ${code}`)
      }, err => {4
        this.snackbarService.openErrorSnackbar(`There was an error deleting experiment ${code}` )
      })
    )
  }

  showCopiedMessage() {
    this.snackbarService.openSuccessSnackbar("Copied to clipboard")
  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe())
  }

}
