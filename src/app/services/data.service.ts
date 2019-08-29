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
