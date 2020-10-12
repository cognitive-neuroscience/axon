import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { SessionStorageService } from './sessionStorage.service';
import { map } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';
import { JWT } from '../models/Login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private sessionStorageService: SessionStorageService) {
  }

  login(email: string, password: string): Observable<HttpResponse<any>> {
    const obj = {
      email: email,
      password: password
    }
    return this.http.post<HttpResponse<any>>(environment.apiBaseURL + '/login', obj, { observe: "response" });
  }

  loginTurker(id: string, expCode: string): Observable<HttpResponse<any>> {
    const obj = {
      id: id,
      code: expCode
    }
    return this.http.post<HttpResponse<any>>(`${environment.apiBaseURL}/login/turker`, obj, { observe: "response" });
  }

  register(email: string, password: string): Observable<HttpResponse<any>> {
    const obj = {
      email: email,
      password: password
    }
    return this.http.post<HttpResponse<any>>(environment.apiBaseURL + '/users', obj, { observe: "response" });
  }

  // backend validates token in header so payload doesn't actually matter
  // TODO: refactor this
  validateToken(token: string): Observable<HttpResponse<any>> {
    const obj = {
      token: token
    }
    return this.http.post<HttpResponse<any>>(environment.apiBaseURL + '/token', obj, { observe: "response" });
  }

  isAuthenticated(): Observable<boolean> {
    const token = this.sessionStorageService.getTokenFromSessionStorage();
    if(!token) return of(false)

    return this.validateToken(token).pipe(
      map(ok => ok.body)
    )
  }

  getDecodedToken(): JWT {
    const token = this.sessionStorageService.getTokenFromSessionStorage()
    if(token) {
      const decodedToken: JWT = jwt_decode(token)
      return decodedToken
    }
    return null
  }
}
