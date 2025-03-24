import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Study } from '../models/Study';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CanClear } from './clearance.service';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import { UserStateService } from './user-state-service';
import { HttpStatus } from '../models/Auth';

@Injectable({
    providedIn: 'root',
})
export class StudyService implements CanClear {
    /**
     * This service is in charge of handling the CRUD operations of studies
     */

    private readonly RESOURCE_PATH = '/studies';
    private _studiesBehaviorSubject: BehaviorSubject<Study[]>;
    private _studyBehaviorSubjectCache: BehaviorSubject<{ [studyId: number]: HttpResponse<Study> }>;

    get studiesValue(): Study[] {
        return this.hasStudiesValue ? this._studiesBehaviorSubject.value : [];
    }

    get hasStudiesValue() {
        return this._studiesBehaviorSubject.value !== null;
    }

    hasStudyValueInCache(studyId: number): HttpResponse<Study> | undefined {
        return this._studyBehaviorSubjectCache.value[studyId];
    }

    constructor(private _http: HttpClient, private userStateService: UserStateService) {
        this._studiesBehaviorSubject = new BehaviorSubject(null);
        this._studyBehaviorSubjectCache = new BehaviorSubject({});
    }

    getOrUpdateStudies(forceUpdate = false): Observable<Study[] | null> {
        if (!this.userStateService.userHasValue) {
            return of([]);
        }

        if (this.hasStudiesValue && !forceUpdate) return of(this.studiesValue);

        return this._getAllStudiesForOrganization(this.userStateService.userOrganization?.id).pipe(
            take(1),
            tap((studies) => {
                this.updateStudiesState(studies);
            })
        );
    }

    updateStudiesState(studies: Study[]) {
        this._studiesBehaviorSubject.next(studies);
    }

    getStudyById(studyId: number): Observable<HttpResponse<Study>> {
        if (this.hasStudyValueInCache(studyId)) {
            return of(this._studyBehaviorSubjectCache.value[studyId]);
        }

        return this._http
            .get<Study>(`${environment.apiBaseURL}${this.RESOURCE_PATH}/${studyId}`, {
                observe: 'response',
            })
            .pipe(
                tap((study) => {
                    this._studyBehaviorSubjectCache.next({
                        ...(this._studyBehaviorSubjectCache.value || {}),
                        [study.body.id]: study,
                    });
                })
            );
    }

    createStudy(study: Study): Observable<any> {
        return this._http
            .post<HttpStatus>(`${environment.apiBaseURL}${this.RESOURCE_PATH}`, study)
            .pipe(mergeMap(() => this.getOrUpdateStudies(true)));
    }

    updateStudy(study: Study, isModifyingTasks: boolean): Observable<Study> {
        return this._http
            .patch<Study>(
                `${environment.apiBaseURL}${this.RESOURCE_PATH}/${study.id}?updateTasks=${isModifyingTasks}`,
                study
            )
            .pipe(
                tap((updatedStudy) => {
                    const updatedStudies = [...this.studiesValue];
                    const updatedStudyIndex = updatedStudies.findIndex((oldStudy) => oldStudy.id === updatedStudy.id);
                    updatedStudies[updatedStudyIndex] = study;
                    this.updateStudiesState(updatedStudies);
                })
            );
    }

    takeSnapshot(studyId: number): Observable<HttpStatus> {
        return this._http
            .patch<HttpResponse<HttpStatus>>(`${environment.apiBaseURL}${this.RESOURCE_PATH}/${studyId}/snapshot`, {})
            .pipe(map((e) => e.body));
    }

    archiveStudy(studyId: number): Observable<HttpStatus> {
        return this._http.delete<HttpStatus>(`${environment.apiBaseURL}${this.RESOURCE_PATH}/${studyId}`).pipe(
            tap(() => {
                const updatedStudies = [...this.studiesValue];
                const deletedStudyIndex = updatedStudies.findIndex((study) => study.id === studyId);
                updatedStudies.splice(deletedStudyIndex, 1);
                this.updateStudiesState(updatedStudies);
            })
        );
    }

    private _getAllStudiesForOrganization(organizationId: number): Observable<Study[]> {
        return this._http.get<Study[]>(
            `${environment.apiBaseURL}${this.RESOURCE_PATH}?organizationId=${organizationId}`
        );
    }

    clearService() {
        this.updateStudiesState(null);
    }
}
