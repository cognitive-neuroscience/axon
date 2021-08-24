import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { map, take, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root",
})
export class EmailService {
    private readonly RESOURCE_PATH = "/email";

    constructor(private http: HttpClient) {}

    sendForgotPasswordEmail(email: string): Observable<boolean> {
        return this.http
            .post<HttpResponse<any>>(
                `${environment.apiBaseURL}${this.RESOURCE_PATH}`,
                { email: email },
                { observe: "response" }
            )
            .pipe(
                map((res) => res.ok),
                take(1)
            );
    }
}
