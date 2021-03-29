import { Injectable } from '@angular/core';
import { DemographicsQuestionnaireResponse, FeedbackQuestionnaireResponse, Questionnaire } from '../models/Questionnaire';
import { HttpClient, HttpResponse } from '@angular/common/http';
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
        RouteMap.webPhenoClinical.id,
        RouteMap.webPhenoClinicalFR.id,
        RouteMap.stressClinical.id,
        RouteMap.stressClinicalFR.id,
        RouteMap.stressClinicalDebrief.id,
        RouteMap.stressPilot.id,
        RouteMap.demographicsquestionnaire.id
    ];

    private _questionnaireExperimentSubject: BehaviorSubject<Questionnaire[]>;
    public questionnaires: Observable<Questionnaire[]>;

    constructor(private http: HttpClient) {
        this._questionnaireExperimentSubject = new BehaviorSubject(null);
        this.questionnaires = this._questionnaireExperimentSubject.asObservable();
    }

    update(): void {
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

    getQuestionnaireByID(id: string): Observable<Questionnaire> {
        return this.http.get<Questionnaire>(`${environment.apiBaseURL}${this.RESOURCE_PATH}${id}`);
    }

    private _getQuestionnaires(): Observable<Questionnaire[]> {
        return this.http.get<Questionnaire[]>(`${environment.apiBaseURL}${this.RESOURCE_PATH}`)
    }

}