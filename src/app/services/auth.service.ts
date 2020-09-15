import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<HttpResponse<any>> {
    const obj = {
      email: email,
      password: password
    }
    console.log(obj);
    
    return this.http.post<HttpResponse<any>>(environment.apiBaseURL + '/login', obj, { observe: "response" });
  }

  register(email: string, password: string): Observable<HttpResponse<any>> {
    const obj = {
      email: email,
      password: password
    }
    console.log(obj);
    
    return this.http.post<HttpResponse<any>>(environment.apiBaseURL + '/users', obj, { observe: "response" });
  }

  validateToken(token: string): Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(environment.apiBaseURL + '/token', { token }, { observe: "response" });
  }

}
