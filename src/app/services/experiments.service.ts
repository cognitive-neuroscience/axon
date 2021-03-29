import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from 'rxjs';
import { Experiment } from '../models/Experiment';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Role } from '../models/InternalDTOs';

@Injectable({
    providedIn: "root"
})
export class ExperimentsService {
    /**
     * This service is in charge of handling the CRUD operations of experiments
     * from the ADMIN's perspective.
     */

    private _experimentBehaviorSubject: BehaviorSubject<Experiment[]>;
    public experiments: Observable<Experiment[]>;

    constructor(private _http: HttpClient, private authService: AuthService) {
        this._experimentBehaviorSubject = new BehaviorSubject(null);
        this.experiments = this._experimentBehaviorSubject.asObservable();
    }

    update(): void {
        // do not get all experiments if role is not auth as it will result in HTTP forbidden
        const jwt = this.authService.getDecodedToken()
        const role = jwt ? jwt.Role : null
        if(role && (role === Role.ADMIN || role === Role.GUEST)) {
            this._getExperiments().pipe(take(1)).subscribe(experiments => {
                this._experimentBehaviorSubject.next(experiments)
            })
        }
    }

    getExperiment(code: string): Observable<Experiment> {
        return this._http.get<Experiment>(`${environment.apiBaseURL}/experiments/${code}`, {observe: "response"}).pipe(
            map(res => res.body as Experiment),
        )
    }

    createExperiment(experiment: Experiment): Observable<any> {
        return this._http.post(`${environment.apiBaseURL}/experiments`, experiment, {observe: "response"})
    }

    deleteExperiment(code: string): Observable<any> {
        return this._http.delete(`${environment.apiBaseURL}/experiments/${code}`, {observe: "response"})
    }

    private _getExperiments(): Observable<Experiment[]> {
        return this._http.get<Experiment[]>(`${environment.apiBaseURL}/experiments`)
    }
}