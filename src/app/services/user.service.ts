import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { User } from "../models/Login";
import { AuthService } from "./auth.service";
import { Role } from "../models/InternalDTOs";

@Injectable({
    providedIn: "root"
})
export class UserService {

    private _guestExperimentSubject: BehaviorSubject<User[]>;
    public guests: Observable<User[]>;


    constructor(private http: HttpClient, private authService: AuthService) {
        this._guestExperimentSubject = new BehaviorSubject(null);
        this.guests = this._guestExperimentSubject.asObservable();
    }

    createGuest(username: string, password: string): Observable<HttpResponse<any>> {
        return this.register(username, password, Role.GUEST);
    }

    deleteUser(email: string): Observable<HttpResponse<any>> {
        return this.http.delete(`${environment.apiBaseURL}/users/${email}`, {observe: "response"})
    }

    update(): void {
        // do not get all experiments if role is not auth as it will result in HTTP forbidden
        const jwt = this.authService.getDecodedToken()
        const role = jwt ? jwt.Role : null
        if(role && (role === Role.ADMIN || role === Role.GUEST)) {
            this._getGuests().pipe(take(1)).subscribe(experiments => {
                this._guestExperimentSubject.next(experiments)
            })
        }
    }
    
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

    
    register(email: string, password: string, role?: Role): Observable<HttpResponse<any>> {
        const obj = {
            email: email,
            password: password
        }
        if(role) obj['role'] = role;
        
        return this.http.post<HttpResponse<any>>(environment.apiBaseURL + '/users', obj, { observe: "response" });
    }

    private _getGuests() {
        return this.http.get<User[]>(`${environment.apiBaseURL}/users/guests`)
    }
}