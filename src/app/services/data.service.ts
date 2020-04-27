import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Experiment } from '../models/Experiment';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private experiments = [];

    constructor(
        private http: HttpClient
    ) { }

    setExperiments(experiments: Experiment[]): void {
        this.experiments = experiments;
    }

    getExperimentByRoute(route: string): Experiment {
        let exp = null;
        this.experiments.forEach((experiment: Experiment) => {
            if (experiment.route === route) {
                exp = experiment;
            }
        });
        return exp;
    }

    getExperiments(): Observable<Experiment[]> {
        return this.http.get<Experiment[]>(environment.apiBaseURL + '/experiments');
    }
}
