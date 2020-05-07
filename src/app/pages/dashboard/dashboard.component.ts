import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
declare function closeFullscreen(): any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  displayedColumnsForExperiments = ['title', 'description', 'route'];

  constructor(
    private router: Router,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    try {
      closeFullscreen();
    } catch (error) {

    }
    this.dataService.retrieveData();
  }

  run(path: string) {
    this.router.navigate([path]);
  }

  get tasks() {
    return (this.dataService.experiments.data || []).filter(t => t.type === 'task');
  }

  get experiments() {
    return (this.dataService.experiments.data || []).filter(t => t.type === 'experiment');
  }

}
