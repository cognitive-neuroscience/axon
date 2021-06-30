import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { BehaviorSubject, Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { CrowdsourcedUser, User } from "../models/Login";
import { Role } from "../models/enums";
import { TimerService } from "./timer.service";

@Injectable({
    providedIn: "root",
})
export class UserService {
    private readonly USERS_RESOURCE_PATH = "/users";
    private readonly CROWDSOURCED_USERS_RESOURCE_PATH = "/crowdsourcedusers";
    isCrowdsourcedUser: boolean = false;
    crowdsourcedUserStudyId: number;

    private _guestsSubject: BehaviorSubject<User[]>;
    get guests(): Observable<User[]> {
        return this._guestsSubject.asObservable();
    }

    get hasGuests(): boolean {
        return this._guestsSubject.value !== null;
    }

    private _userBehaviorSubject: BehaviorSubject<User>;
    get userAsync(): Observable<User> {
        return this._userBehaviorSubject.asObservable();
    }
    get userHasValue(): boolean {
        return this._userBehaviorSubject.value !== null;
    }
    get user(): User {
        return this._userBehaviorSubject.value;
    }

    get userIsAdmin(): Observable<boolean> {
        return this._userBehaviorSubject.asObservable().pipe(map((user) => (user ? user.role === Role.ADMIN : false)));
    }

    constructor(private http: HttpClient, private timerService: TimerService) {
        this._guestsSubject = new BehaviorSubject(null);
        this._userBehaviorSubject = new BehaviorSubject(null);
    }

    createGuest(username: string, password: string): Observable<HttpResponse<any>> {
        return this.registerUser(username, password, Role.GUEST);
    }

    deleteGuest(guest: User): Observable<HttpResponse<any>> {
        return this.http.delete(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}/${guest.id}`, {
            observe: "response",
        });
    }

    updateUser(): void {
        if (this.isCrowdsourcedUser) {
            this._getCrowdsourcedUser(this.crowdsourcedUserStudyId)
                .pipe(take(1))
                .subscribe(
                    (crowdsourcedUser) => {
                        const user: User = {
                            id: 0,
                            email: crowdsourcedUser.participantId,
                            role: Role.PARTICIPANT,
                            createdAt: crowdsourcedUser.registerDate,
                        };
                        this._userBehaviorSubject.next(user);
                    },
                    (err) => {
                        throw new Error(err);
                    }
                );
        } else {
            this._getUser()
                .pipe(take(1))
                .subscribe(
                    (user) => {
                        this._userBehaviorSubject.next(user);
                    },
                    (err) => {
                        throw new Error(err);
                    }
                );
        }
    }

    updateGuests(): void {
        this._getGuests()
            .pipe(take(1))
            .subscribe((guests) => {
                this._guestsSubject.next(guests);
            });
    }

    markCompletion(studyId: number): Observable<string> {
        return this.http
            .patch(`${environment.apiBaseURL}${this.CROWDSOURCED_USERS_RESOURCE_PATH}/${studyId}`, {
                observe: "response",
            })
            .pipe(map((res) => res as string));
    }

    registerUser(email: string, password: string, role?: Role): Observable<HttpResponse<any>> {
        const obj = {
            email: email,
            password: password,
        };
        if (role) obj["role"] = role;

        return this.http.post<HttpResponse<any>>(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}`, obj, {
            observe: "response",
        });
    }

    registerCrowdsourcedUser(participantId: string, studyID: number): Observable<HttpResponse<any>> {
        const crowdsourcedUser: CrowdsourcedUser = {
            participantId: participantId,
            studyId: studyID,
            registerDate: this.timerService.getCurrentTimestamp(),
            completionCode: "",
        };

        return this.http.post(`${environment.apiBaseURL}${this.CROWDSOURCED_USERS_RESOURCE_PATH}`, crowdsourcedUser, {
            observe: "response",
        });
    }

    private _getGuests() {
        return this.http.get<User[]>(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}/guests`);
    }

    private _getUser() {
        return this.http.get<User>(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}`);
    }

    private _getCrowdsourcedUser(studyId: number) {
        return this.http.get<CrowdsourcedUser>(
            `${environment.apiBaseURL}${this.CROWDSOURCED_USERS_RESOURCE_PATH}/${studyId}`
        );
    }
}
