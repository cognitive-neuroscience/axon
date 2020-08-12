import { Component, OnInit } from '@angular/core';
import { Experiment } from 'src/app/models/Experiment';
import { ExperimentsService } from 'src/app/services/experiments.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateExperimentDialogComponent } from './create-experiment-dialog/create-experiment-dialog.component';
import { Task } from 'src/app/models/Task';

@Component({
  selector: 'app-view-experiments',
  templateUrl: './view-experiments.component.html',
  styleUrls: ['./view-experiments.component.scss']
})
export class ViewExperimentsComponent implements OnInit {

  constructor(
    private _experimentsService: ExperimentsService,
    public dialog: MatDialog
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

  private _createExperiment(experiment: Experiment) {
    this._experimentsService.createExperiment(experiment).subscribe(done => {
      this.getExperiments()
    })
  }

  getExperiments() {
    this._experimentsService.getExperiments().subscribe((experiments) => {
      this.experiments = experiments
    })
  }

  deleteExperiment(code: string) {
    this._experimentsService.deleteExperiment(code).subscribe(data => {
      this.getExperiments()
      // add toast
    })
  }

}
