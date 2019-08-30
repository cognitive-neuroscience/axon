import { Component, OnInit, OnDestroy } from '@angular/core';
import { Experiment } from 'src/app/models/Experiment';
import { Questionnaire } from 'src/app/models/Questionnaire';
import { Workflow } from 'src/app/models/Workflow';
import { DataService } from 'src/app/services/data.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {


  /**
   * List of tasks
   *
   * @type {Experiment[]}
   * @memberof DashboardComponent
   */
  tasks: Experiment[] = [];


  /**
   * List of experiments
   *
   * @type {Experiment[]}
   * @memberof DashboardComponent
   */
  experiments: Experiment[] = [];


  /**
   * List of questionnaires
   *
   * @type {Questionnaire[]}
   * @memberof DashboardComponent
   */
  questionnaires: Questionnaire[] = [];


  /**
   * List of workflows
   *
   * @type {Workflow[]}
   * @memberof DashboardComponent
   */
  workflows: Workflow[] = [];


  /**
   * List of columns to show on the table in the view
   *
   * @type {string[]}
   * @memberof DashboardComponent
   */
  displayedColumns: string[] = ['title', 'description', 'config']


  /**
   * Subscription to experiments
   *
   * @type {Subscription}
   * @memberof DashboardComponent
   */
  experimentsSubscription: Subscription = new Subscription();


  /**
   * Subscription to questionnaires
   *
   * @type {Subscription}
   * @memberof DashboardComponent
   */
  questionnairesSubscription: Subscription = new Subscription();


  /**
   * Subscription to workflows
   *
   * @type {Subscription}
   * @memberof DashboardComponent
   */
  workflowsSubscription: Subscription = new Subscription();


  /**
   * Creates an instance of DashboardComponent
   * 
   * @param {DataService} dataService
   * @memberof DashboardComponent
   */
  constructor(
    private dataService: DataService,
    private router: Router
  ) { }


  /**
   * ngOnInit lifecycle hook
   *
   * @memberof DashboardComponent
   */
  ngOnInit() {
    this.experimentsSubscription = this.dataService.getExperiments().subscribe((results: Experiment[]) => {
      this.tasks = results.filter(result => result.description.includes('Task'));
      this.experiments = results.filter(result => !result.description.includes('Task'));
    }, (error) => {
      console.error(error);
    });
    this.questionnairesSubscription = this.dataService.getQuestionnaires().subscribe((results: Questionnaire[]) => {
      this.questionnaires = results;
    }, (error) => {
      console.error(error);
    });
    this.workflowsSubscription = this.dataService.getWorkflows().subscribe((results: Workflow[]) => {
      this.workflows = results;
    }, (error) => {
      console.error(error);
    });
  }


  /**
   * ngOnDestroy lifecycle hook
   *
   * @memberof DashboardComponent
   */
  ngOnDestroy() {
    this.experimentsSubscription.unsubscribe();
    this.questionnairesSubscription.unsubscribe();
    this.workflowsSubscription.unsubscribe();
  }


  run(prefix: string, path: string) {
    this.router.navigate([`/${prefix}/${path}`]);
  }

}
