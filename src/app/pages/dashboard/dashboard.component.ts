import { Component, OnInit, OnDestroy } from '@angular/core';
import { Experiment } from 'src/app/models/Experiment';
import { DataService } from 'src/app/services/data.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
declare function closeFullscreen(): any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  tasks: Experiment[] = [];
  experiments: Experiment[] = [];
  displayedColumnsForExperiments: string[] = ['title', 'description', 'route'];
  displayedColumnsForOthers: string[] = ['title', 'description', 'data'];
  experimentsSubscription: Subscription = new Subscription();
  questionnairesSubscription: Subscription = new Subscription();
  workflowsSubscription: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private router: Router
  ) { }

  async ngOnInit() {

    try {
      await closeFullscreen();
    } catch (error) {

    }

    this.experimentsSubscription = this.dataService.getExperiments().subscribe((results: Experiment[]) => {
      this.dataService.setExperiments(results);
      this.tasks = results.filter(result => result.type === 'task').sort((a, b) => {
        if (a.id > b.id) return 1; else return -1;
      });
      this.experiments = results.filter(result => result.type === 'experiment').sort((a, b) => {
        if (a.id > b.id) return 1; else return -1;
      });;
    }, (error) => {
      console.error(error);
    });

  }

  ngOnDestroy() {
    this.experimentsSubscription.unsubscribe();
    this.questionnairesSubscription.unsubscribe();
    this.workflowsSubscription.unsubscribe();
  }

  run(prefix: string, path: string) {
    this.router.navigate([`/${prefix}/${path}`]);
  }

}
