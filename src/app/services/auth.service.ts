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


  /**
   * Creates an instance of AuthService
   * 
   * @param {HttpClient} http
   * @memberof AuthService
   */
  constructor(
    private http: HttpClient
  ) { }


  /**
   * Initiate a login request based on the entered credentials
   *
   * @param {LoginCredentials} model
   * @returns {Observable<any>}
   * @memberof AuthService
   */
  login(model: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.apiBaseURL + '/login', model);
  }
}
