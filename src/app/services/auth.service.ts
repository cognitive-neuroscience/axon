import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(model: { email: string, password: string }): Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(environment.apiBaseURL + '/login', model, { observe: "response" });
  }

  register(model: { email: string, password: string, setCode: string }): Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(environment.apiBaseURL + '/users', model, { observe: "response" });
  }

  validateToken(token: string): Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(environment.apiBaseURL + '/token', { token }, { observe: "response" });
  }

}
