import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: "root"
})
export class UserService {

    constructor(private http: HttpClient) {}
    
    markUserAsComplete(userID: string, experimentCode: string): Observable<HttpResponse<any>> {
        const obj = {
            id: userID,
            code: experimentCode
        }
        return this.http.post(`${environment.apiBaseURL}/users/complete`, obj, {observe: "response"})
    }

    getCompletionCode(userID: string, experimentCode: string): Observable<string> {
        return this.http.get(`${environment.apiBaseURL}/users/${userID}/${experimentCode}`, {observe: "response"}).pipe(
            map(res => res.body as string)
        )
    }
}