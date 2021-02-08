import { Injectable } from '@angular/core';
import { DemographicsQuestionnaireResponse, FeedbackQuestionnaireResponse, Questionnaire } from '../models/Questionnaire';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: "root"
})
export class QuestionnaireService {

    private _questionnaireExperimentSubject: BehaviorSubject<Questionnaire[]>;
    public questionnaires: Observable<Questionnaire[]>;

    constructor(private http: HttpClient) {
        this._questionnaireExperimentSubject = new BehaviorSubject(null);
        this.questionnaires = this._questionnaireExperimentSubject.asObservable();
    }

    updateQuestionnaires(): void {
        this._getQuestionnaires().subscribe(questionnaires => {
            this._questionnaireExperimentSubject.next(questionnaires);
        })
    }

    createQuestionnaire(): Observable<HttpResponse<any>> {
        return of(null)
    }


    saveDemographicsQuestionnaireResponse(response: DemographicsQuestionnaireResponse): Observable<any> {
        return this.http.post(`${environment.apiBaseURL}/questionnaire/demographics`, response, { observe: "response" }).pipe(
            map(x => x.ok)
        )
    }

    saveFeedQuestionnaireResponse(response: FeedbackQuestionnaireResponse): Observable<boolean> {
        return this.http.post(`${environment.apiBaseURL}/questionnaire/feedback`, response, { observe: "response" }).pipe(
            map(x => x.ok)
        )
    }

    private _getQuestionnaires(): Observable<Questionnaire[]> {
        return of([
            {
                questionnaireID: 1,
                URL: "somequestionnaire.com",
                name: "my questionnaire",
                description: "my test questionnaire description"
            },
            {
                questionnaireID: 2,
                URL: "somequestionnaire.com",
                name: "another questionnaire",
                description: "my other questionnaire description"
            }
        ])
        // return this.http.get<Questionnaire[]>(`${environment.apiBaseURL}/questionnaire`)
    }

}