import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Experiment } from '../models/Experiment';
import { Questionnaire } from '../models/Questionnaire';
import { Workflow } from '../models/Workflow';

@Injectable({
    providedIn: 'root'
})
export class DataService {


    /**
     * List of experiments
     *
     * @private
     * @memberof DataService
     */
    private experiments = [];

    /**
     * Set experiments
     *
     * @param {Experiment[]} experiments
     * @memberof DataService
     */
    setExperiments(experiments: Experiment[]): void {
        this.experiments = experiments;
    }


    /**
     * Get Experiment by route
     *
     * @param {string} route
     * @returns {Experiment}
     * @memberof DataService
     */
    getExperimentByRoute(route: string): Experiment {
        let exp = null;
        this.experiments.forEach((experiment: Experiment) => {
            if (experiment.route === route) {
                exp = experiment;
            }
        });
        return exp;
    }

    /**
     * Creates an instance of DataService
     * 
     * @param {HttpClient} http
     * @memberof DataService
     */
    constructor(
        private http: HttpClient
    ) { }


    /**
     * Get list of experiments (preliminary + bigger ones)
     *
     * @returns {Observable<Experiment[]>}
     * @memberof DataService
     */
    getExperiments(): Observable<Experiment[]> {
        return this.http.get<Experiment[]>(environment.apiBaseURL + '/experiments');
    }


    /**
     * Get list of questionnaires
     *
     * @returns {Observable<Questionnaire[]>}
     * @memberof DataService
     */
    getQuestionnaires(): Observable<Questionnaire[]> {
        return this.http.get<Questionnaire[]>(environment.apiBaseURL + '/questionnaires');
    }


    /**
     * Get List of workflows
     *
     * @returns {Observable<Workflow[]>}
     * @memberof DataService
     */
    getWorkflows(): Observable<Workflow[]> {
        return this.http.get<Workflow[]>(environment.apiBaseURL + '/workflows');
    }
}
