import { Injectable } from '@angular/core';
import { DemographicsQuestionnaireResponse } from '../models/Questionnaire';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: "root"
})
export class QuestionnaireService {

    constructor(private http: HttpClient) {}

    saveDemographicsQuestionnaireResponse(response: DemographicsQuestionnaireResponse): Observable<any> {
        return this.http.post(`${environment.apiBaseURL}/questionnaire`, response, { observe: "response" })
    }

}