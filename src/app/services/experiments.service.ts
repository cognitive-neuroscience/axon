import { Injectable } from "@angular/core";
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Experiment } from '../models/Experiment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: "root"
})
export class ExperimentsService {

    private _experimentBehaviorSubject: BehaviorSubject<Experiment[]>;

    public experiments: Observable<Experiment[]>;

    constructor(private _http: HttpClient) {
        this._experimentBehaviorSubject = new BehaviorSubject(null);
        this.experiments = this._experimentBehaviorSubject.asObservable();
        this.updateExperiments();
    }

    updateExperiments(): void {
        this._getExperiments().subscribe(experiments => {
            this._experimentBehaviorSubject.next(experiments)
        })
    }

    createExperiment(experiment: Experiment): Observable<any> {
        let exp = experiment["experiment"]
        return this._http.post<HttpResponse<any>>(`${environment.apiBaseURL}/experiments`, exp, {observe: "response"})
    }

    deleteExperiment(code): Observable<any> {
        return this._http.delete<HttpResponse<any>>(`${environment.apiBaseURL}/experiments/${code}`, {observe: "response"})
    }

    private _getExperiments(): Observable<Experiment[]> {
        return this._http.get<Experiment[]>(`${environment.apiBaseURL}/experiments`)
    }
}