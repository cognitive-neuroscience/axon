import { Injectable } from '@angular/core';
import { MturkQuestionnaireResponse } from '../models/Questionnaire';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: "root"
})
export class QuestionnaireService {

    constructor(private http: HttpClient) {}

    saveQuestionnaireResponse(response: MturkQuestionnaireResponse): Observable<any> {
        console.log(response);
        
        return this.http.post(`${environment.apiBaseURL}/questionnaire`, response, { observe: "response" }).pipe(
            tap(x => console.log(x)
            )
        )
    }

}