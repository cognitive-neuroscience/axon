import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(model): Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(environment.apiBaseURL + '/login', model, { observe: "response" });
  }

}
