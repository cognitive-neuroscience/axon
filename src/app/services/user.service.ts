import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { BehaviorSubject, Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { User } from "../models/Login";
import { Role } from "../models/enums";

@Injectable({
    providedIn: "root",
})
export class UserService {
    private readonly RESOURCE_PATH = "/users";

    private _guestsSubject: BehaviorSubject<User[]>;
    get guests(): Observable<User[]> {
        return this._guestsSubject.asObservable();
    }

    get hasGuests(): boolean {
        return this._guestsSubject.value !== null;
    }

    private _userBehaviorSubject: BehaviorSubject<User>;
    get user(): Observable<User> {
        return this._userBehaviorSubject.asObservable();
    }
    get userHasValue(): boolean {
        return this._userBehaviorSubject.value !== null;
    }

    get userIsAdmin(): Observable<boolean> {
        return this._userBehaviorSubject.asObservable().pipe(map((user) => (user ? user.role === Role.ADMIN : false)));
    }

    constructor(private http: HttpClient) {
        this._guestsSubject = new BehaviorSubject(null);
        this._userBehaviorSubject = new BehaviorSubject(null);
    }

    createGuest(username: string, password: string): Observable<HttpResponse<any>> {
        return this.registerUser(username, password, Role.GUEST);
    }

    deleteGuest(guest: User): Observable<HttpResponse<any>> {
        return this.http.delete(`${environment.apiBaseURL}${this.RESOURCE_PATH}/${guest.id}`, {
            observe: "response",
        });
    }

    getUserDetails(id: string): Observable<HttpResponse<any>> {
        return this.http.get(`${environment.apiBaseURL}${this.RESOURCE_PATH}/${id}`, { observe: "response" });
    }

    updateUser(): void {
        this._getUser()
            .pipe(take(1))
            .subscribe((user) => {
                this._userBehaviorSubject.next(user);
            });
    }

    updateGuests(): void {
        this._getGuests()
            .pipe(take(1))
            .subscribe((guests) => {
                this._guestsSubject.next(guests);
            });
    }

    markUserAsComplete(userID: string, studyCode: string): Observable<HttpResponse<any>> {
        const obj = {
            id: userID,
            code: studyCode,
        };
        return this.http.post(`${environment.apiBaseURL}${this.RESOURCE_PATH}/complete`, obj, { observe: "response" });
    }

    getCompletionCode(userID: string, studyCode: string): Observable<string> {
        return this.http
            .get(`${environment.apiBaseURL}${this.RESOURCE_PATH}/${userID}/${studyCode}`, { observe: "response" })
            .pipe(map((res) => res.body as string));
    }

    registerUser(email: string, password: string, role?: Role): Observable<HttpResponse<any>> {
        const obj = {
            email: email,
            password: password,
        };
        if (role) obj["role"] = role;

        return this.http.post<HttpResponse<any>>(`${environment.apiBaseURL}${this.RESOURCE_PATH}`, obj, {
            observe: "response",
        });
    }

    private _getGuests() {
        return this.http.get<User[]>(`${environment.apiBaseURL}${this.RESOURCE_PATH}/guests`);
    }

    private _getUser() {
        return this.http.get<User>(`${environment.apiBaseURL}${this.RESOURCE_PATH}`);
    }
}
