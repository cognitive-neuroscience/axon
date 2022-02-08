import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Study } from '../models/Study';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs/operators';
import { CanClear } from './clearance.service';

@Injectable({
    providedIn: 'root',
})
export class StudyService implements CanClear {
    /**
     * This service is in charge of handling the CRUD operations of studies
     * from the ADMIN's perspective.
     */

    private readonly RESOURCE_PATH = '/studies';

    private _studiesBehaviorSubject: BehaviorSubject<Study[]>;
    get studiesAsync(): Observable<Study[]> {
        return this._studiesBehaviorSubject.asObservable();
    }

    get studies(): Study[] {
        return this._studiesBehaviorSubject.value;
    }

    get hasStudies() {
        return this._studiesBehaviorSubject.value !== null;
    }

    constructor(private _http: HttpClient) {
        this._studiesBehaviorSubject = new BehaviorSubject(null);
    }

    update(): void {
        this._getAllStudies()
            .pipe(take(1))
            .subscribe((studies) => {
                this._studiesBehaviorSubject.next(studies);
            });
    }

    getStudyById(studyId: number): Observable<HttpResponse<Study>> {
        return this._http.get<Study>(`${environment.apiBaseURL}${this.RESOURCE_PATH}/${studyId}`, {
            observe: 'response',
        });
    }

    createStudy(study: Study): Observable<HttpResponse<any>> {
        return this._http.post<HttpResponse<any>>(`${environment.apiBaseURL}${this.RESOURCE_PATH}`, study, {
            observe: 'response',
        });
    }

    editStudy(study: Study, isModifyingTasks: boolean): Observable<HttpResponse<any>> {
        return this._http.put<HttpResponse<any>>(
            `${environment.apiBaseURL}${this.RESOURCE_PATH}/${study.id}?includetasksupdate=${isModifyingTasks}`,
            study,
            {
                observe: 'response',
            }
        );
    }

    deleteStudy(studyId: number): Observable<HttpResponse<any>> {
        return this._http.delete(`${environment.apiBaseURL}${this.RESOURCE_PATH}/${studyId}`, { observe: 'response' });
    }

    private _getAllStudies(): Observable<Study[]> {
        return this._http.get<Study[]>(`${environment.apiBaseURL}${this.RESOURCE_PATH}`);
    }

    clearService() {
        if (this._studiesBehaviorSubject.value) {
            this._studiesBehaviorSubject.next(null);
        }
    }
}
