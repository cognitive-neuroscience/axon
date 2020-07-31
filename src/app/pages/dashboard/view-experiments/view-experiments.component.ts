import { Component, OnInit } from '@angular/core';
import { Experiment } from 'src/app/models/Experiment';
import { ExperimentsService } from 'src/app/services/experiments.service';

@Component({
  selector: 'app-view-experiments',
  templateUrl: './view-experiments.component.html',
  styleUrls: ['./view-experiments.component.scss']
})
export class ViewExperimentsComponent implements OnInit {

  constructor(private _experimentsService: ExperimentsService) { }

  experiments: Experiment[] = [];

  ngOnInit(): void {
    this.getExperiments();
  }

  getExperiments() {
    this._experimentsService.getExperiments().subscribe((experiments) => {
      this.experiments = experiments
    })
  }

}
