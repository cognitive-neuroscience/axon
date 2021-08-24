import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { BehaviorSubject, Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { CrowdsourcedUser, StudyUser, User } from "../models/Login";
import { Role } from "../models/enums";
import { TimerService } from "./timer.service";
import { CanClear } from "./clearance.service";

@Injectable({
    providedIn: "root",
})
export class UserService implements CanClear {
    private readonly USERS_RESOURCE_PATH = "/users";
    private readonly CROWDSOURCED_USERS_RESOURCE_PATH = "/crowdsourcedusers";
    private readonly STUDY_USERS_RESOURCE_PATH = "/studyusers";
    isCrowdsourcedUser: boolean = false;
    crowdsourcedUserStudyId: number;

    private _studyUsersSubject: BehaviorSubject<StudyUser[]>;
    get studyUsers(): Observable<StudyUser[]> {
        return this._studyUsersSubject.asObservable();
    }

    get hasStudyUsers(): boolean {
        return this._studyUsersSubject.value !== null;
    }

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
        this._studyUsersSubject = new BehaviorSubject(null);
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
                            changePasswordRequired: false,
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

    updateStudyUsers(): void {
        this._getStudyUsers()
            .pipe(take(1))
            .subscribe((studyUsers) => {
                this._studyUsersSubject.next(studyUsers);
            });
    }

    markCompletion(studyId: number): Observable<string> {
        return this.http
            .patch(`${environment.apiBaseURL}${this.CROWDSOURCED_USERS_RESOURCE_PATH}/${studyId}`, {
                observe: "response",
            })
            .pipe(map((res) => res as string));
    }

    updateStudyUser(studyUser: StudyUser): Observable<any> {
        return this.http.patch(`${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}`, studyUser);
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

    getCrowdsourcedUsersByStudyId(studyId: number): Observable<CrowdsourcedUser[]> {
        return this.http.get<CrowdsourcedUser[]>(
            `${environment.apiBaseURL}${this.CROWDSOURCED_USERS_RESOURCE_PATH}/${studyId}`
        );
    }

    changePassword(email: string, tempPassword: string, oldPassword: string): Observable<any> {
        return this.http.post(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}/changepassword`, {
            email,
            tempPassword,
        });
    }

    // register a given account holding participant with a study id
    registerParticipantForStudy(user: User, studyId: number): Observable<any> {
        const studyUser: StudyUser = {
            userId: user.id,
            studyId: studyId,
            completionCode: "",
            registerDate: this.timerService.getCurrentTimestamp(),
            dueDate: {
                valid: false,
                time: this.timerService.getCurrentTimestamp(),
            }, // nullable time
            currentTaskIndex: 0,
            hasAcceptedConsent: false,
        };

        return this.http.post(`${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}`, studyUser);
    }

    getStudyUsersForStudy(studyId: number): Observable<StudyUser[]> {
        return this.http.get<StudyUser[]>(`${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}/${studyId}`);
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
            `${environment.apiBaseURL}${this.CROWDSOURCED_USERS_RESOURCE_PATH}/user/${studyId}`
        );
    }

    private _getStudyUsers(): Observable<StudyUser[]> {
        return this.http.get<StudyUser[]>(`${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}/studies`);
    }

    clearService() {
        if (this._guestsSubject.value) {
            this._guestsSubject.next(null);
        }
        if (this._studyUsersSubject.value) {
            this._studyUsersSubject.next(null);
        }
        if (this._userBehaviorSubject.value) {
            this._userBehaviorSubject.next(null);
        }
    }
}
