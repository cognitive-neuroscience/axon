import { Injectable } from "@angular/core";
import { Observable, of } from 'rxjs';
import { Experiment } from '../models/Experiment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: "root"
})
export class ExperimentsService {

    constructor(private _http: HttpClient) {}

    getExperiments(): Observable<any> {
        // return of(this.mockExperiments);
        return this._http.get(`${environment.apiBaseURL}/experiments`)
    }

    createExperiment(experiment: Experiment): Observable<any> {
        let exp = experiment["experiment"]
        console.log(JSON.stringify(exp));
        
        return this._http.post<HttpResponse<any>>(`${environment.apiBaseURL}/experiments`, exp, {observe: "response"})
    }

    deleteExperiment(code): Observable<any> {
        return this._http.delete<HttpResponse<any>>(`${environment.apiBaseURL}/experiments/${code}`, {observe: "response"})
    }
}