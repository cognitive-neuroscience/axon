import { Injectable } from '@angular/core';
import { DemographicsQuestionnaireResponse, FeedbackQuestionnaireResponse } from '../models/Questionnaire';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: "root"
})
export class QuestionnaireService {

    constructor(private http: HttpClient) {}

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

}