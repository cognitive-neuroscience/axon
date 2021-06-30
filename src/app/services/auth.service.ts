import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { SessionStorageService } from "./sessionStorage.service";
import { TimerService } from "./timer.service";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    constructor(
        private http: HttpClient,
        private sessionStorageService: SessionStorageService,
        private timerService: TimerService
    ) {}

    login(email: string, password: string): Observable<HttpResponse<any>> {
        const obj = {
            email: email,
            password: password,
        };
        return this.http.post<HttpResponse<any>>(environment.apiBaseURL + "/login", obj, { observe: "response" });
    }

    logout(): Observable<HttpResponse<any>> {
        this.sessionStorageService.clearSessionStorage();
        return this.http.post<HttpResponse<any>>(`${environment.apiBaseURL}/logout`, { observe: "response" });
    }

    loginTurker(id: string, expCode: string): Observable<HttpResponse<any>> {
        const obj = {
            id: id.trim(),
            code: expCode,
            registerDate: this.timerService.getCurrentTimestamp(),
        };
        return this.http.post<HttpResponse<any>>(`${environment.apiBaseURL}/login/turker`, obj, {
            observe: "response",
        });
    }
}
