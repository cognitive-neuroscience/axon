import { Injectable } from '@angular/core';
import { LoginCredentials } from '../models/LoginCredentials';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { LoginResponse } from '../models/LoginResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(model: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.apiBaseURL + '/login', model);
  }

}
