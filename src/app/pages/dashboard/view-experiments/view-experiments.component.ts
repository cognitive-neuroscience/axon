import { Component, OnInit } from '@angular/core';
import { Experiment } from 'src/app/models/Experiment';
import { ExperimentsService } from 'src/app/services/experiments.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateExperimentDialogComponent } from './create-experiment-dialog/create-experiment-dialog.component';
import { Task } from 'src/app/models/Task';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-view-experiments',
  templateUrl: './view-experiments.component.html',
  styleUrls: ['./view-experiments.component.scss']
})
export class ViewExperimentsComponent implements OnInit {

  constructor(
    private experimentsService: ExperimentsService,
    public dialog: MatDialog,
  ) { }

  experiments: Experiment[] = [];

  tasks: Task[] = [];

  ngOnInit(): void {
    this.getExperiments();
  }

  openCreateExperimentDialog() {
    const dialogRef = this.dialog.open(CreateExperimentDialogComponent)

    dialogRef.afterClosed().subscribe((data: Experiment) => {      
      if(data) this._createExperiment(data);
    })
  }

  private updateExperiments() {
    this.experimentsService.updateExperiments()
  }

  private _createExperiment(experiment: Experiment) {
    this.experimentsService.createExperiment(experiment).subscribe(() => {
      this.updateExperiments()
    })
  }

  getExperiments() {
    this.experimentsService.experiments.subscribe(experiments => {
      this.experiments = experiments
    })
  }

  deleteExperiment(code: string) {
    this.experimentsService.deleteExperiment(code).subscribe((data: HttpResponse<any>) => {
      console.log(data);
      this.updateExperiments()
      // add toast
    })
  }

}
