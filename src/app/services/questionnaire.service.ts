import { Injectable } from '@angular/core';
import { DemographicsQuestionnaireResponse, FeedbackQuestionnaireResponse, ApathyQuestionnaireResponse, Questionnaire } from '../models/Questionnaire';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteMap } from '../routing/routes';

@Injectable({
    providedIn: "root"
})
export class QuestionnaireService {

    private readonly RESOURCE_PATH = "/questionnaire/"

    readonly includedRouteMapQuestionnaires: string[] = [
        RouteMap.consent.id,
        RouteMap.demographicsquestionnaire.id
    ];

    private _questionnaireExperimentSubject: BehaviorSubject<Questionnaire[]>;
    public questionnaires: Observable<Questionnaire[]>;

    constructor(private http: HttpClient) {
        this._questionnaireExperimentSubject = new BehaviorSubject(null);
        this.questionnaires = this._questionnaireExperimentSubject.asObservable();
    }

    updateQuestionnaires(): void {
        this._getQuestionnaires().subscribe(questionnaires => {

            for(const [_, value] of Object.entries(RouteMap)) {
                if(this.includedRouteMapQuestionnaires.includes(value.id)) {
                    questionnaires.push({
                        questionnaireID: value.id,
                        url: null,
                        name: value.title,
                        description: value.description
                    })
                }
            }

            this._questionnaireExperimentSubject.next(questionnaires);
        })
    }

    createQuestionnaire(questionnaire: Questionnaire): Observable<boolean> {
        return this.http.post(`${environment.apiBaseURL}${this.RESOURCE_PATH}`, questionnaire, {observe: "response"}).pipe(
            map(x => x.ok)
        )
    }

    deleteQuestionnaireByID(id: string): Observable<boolean> {
        return this.http.delete(`${environment.apiBaseURL}${this.RESOURCE_PATH}${id}`, { observe: "response" }).pipe(
            map(x => x.ok)
        )
    }

    saveDemographicsQuestionnaireResponse(response: DemographicsQuestionnaireResponse): Observable<boolean> {
        return this.http.post(`${environment.apiBaseURL}${this.RESOURCE_PATH}demographics`, response, { observe: "response" }).pipe(
            map(x => x.ok)
        )
    }

    saveFeedQuestionnaireResponse(response: FeedbackQuestionnaireResponse): Observable<boolean> {
        return this.http.post(`${environment.apiBaseURL}${this.RESOURCE_PATH}feedback`, response, { observe: "response" }).pipe(
            map(x => x.ok)
        )
    }

    saveApathyQuestionnaireResponse(response: ApathyQuestionnaireResponse): Observable<boolean> {
        return this.http.post(`${environment.apiBaseURL}/questionnaire/apathy`, response, { observe: "response" }).pipe(
            map(x => x.ok)
        )
    }

    private _getQuestionnaires(): Observable<Questionnaire[]> {
        return this.http.get<Questionnaire[]>(`${environment.apiBaseURL}${this.RESOURCE_PATH}`)
    }

}