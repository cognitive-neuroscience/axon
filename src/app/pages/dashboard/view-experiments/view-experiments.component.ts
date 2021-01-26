import { Component, OnDestroy, OnInit } from '@angular/core';
import { Experiment } from 'src/app/models/Experiment';
import { ExperimentsService } from 'src/app/services/experiments.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateExperimentDialogComponent } from './create-experiment-dialog/create-experiment-dialog.component';
import { HttpResponse } from '@angular/common/http';
import { ConfirmationService } from '../../../services/confirmation.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { mapTaskIdToTitle } from '../../../models/TaskData';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-view-experiments',
  templateUrl: './view-experiments.component.html',
  styleUrls: ['./view-experiments.component.scss']
})
export class ViewExperimentsComponent implements OnInit, OnDestroy {

  mapTaskIdToTitle = mapTaskIdToTitle;

  PROD_LINK: string = "https://psharplab.campus.mcgill.ca/#/login/mturk?code=";
  DEV_LINK: string = "http://localhost:4200/#/login/mturk?code="
  SHOWN_LINK: string;

  subscriptions: Subscription[] = []

  constructor(
    private experimentsService: ExperimentsService,
    public dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private snackbarService: SnackbarService,
    private authService: AuthService
  ) { }


  experiments: Observable<Experiment[]>;

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.setLink()

    this.experiments = this.experimentsService.experiments.pipe(
      map(x => x?.filter(experiment => !experiment.deleted))
    )
    this.updateExperiments()
  }

  openCreateExperimentDialog() {
    const dialogRef = this.dialog.open(CreateExperimentDialogComponent, {width: "30%"})
    this.subscriptions.push(
      dialogRef.afterClosed().subscribe((data: Experiment) => {      
        if(data) this._createExperiment(data);
      })
    )
  }

  private updateExperiments() {
    this.experimentsService.updateExperiments()
  }

  private _createExperiment(experiment: Experiment) {
    this.subscriptions.push(
      this.experimentsService.createExperiment(experiment).subscribe(() => {
        this.updateExperiments()
      })
    )
  }

  private setLink(): void {
    this.SHOWN_LINK = environment.production ? this.PROD_LINK : this.DEV_LINK
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
