import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { CrowdsourcedUser, User } from '../models/Login';
import { Role, SupportedLangs } from '../models/enums';
import { TimerService } from './timer.service';
import { CanClear } from './clearance.service';
import { SessionStorageService } from './sessionStorage.service';

@Injectable({
    providedIn: 'root',
})
export class UserService implements CanClear {
    private readonly USERS_RESOURCE_PATH = '/users';
    private readonly CROWDSOURCED_USERS_RESOURCE_PATH = '/crowdsourcedusers';

    get isCrowdsourcedUser(): boolean {
        return this.sessionStorageService.getIsCrowdsourcedUser();
    }

    get currentlyRunningStudyId(): number {
        return parseInt(this.sessionStorageService.getCurrentlyRunningStudyIdFromSessionStorage());
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
        return this.userAsync.pipe(map((user) => (user ? user.role === Role.ADMIN : false)));
    }

    constructor(
        private http: HttpClient,
        private timerService: TimerService,
        private sessionStorageService: SessionStorageService
    ) {
        this._guestsSubject = new BehaviorSubject(null);
        this._userBehaviorSubject = new BehaviorSubject(null);
    }

    createGuest(username: string, password: string): Observable<HttpResponse<any>> {
        return this.registerUser(username, password, Role.GUEST);
    }

    deleteGuest(guest: User): Observable<HttpResponse<any>> {
        return this.http.delete(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}/${guest.id}`, {
            observe: 'response',
        });
    }

    // gets the user value and updates it if it does not exist
    getUser(forceUpdate = false): Observable<User> {
        if (this.userHasValue && !forceUpdate) {
            return this.userAsync;
        } else {
            return this.isCrowdsourcedUser
                ? this._getCrowdsourcedUser(this.currentlyRunningStudyId).pipe(
                      map((crowdsourcedUser) => ({
                          id: 0,
                          email: crowdsourcedUser.participantId,
                          role: Role.PARTICIPANT,
                          createdAt: crowdsourcedUser.registerDate,
                          changePasswordRequired: false,
                          lang: SupportedLangs.NONE,
                      })),
                      tap((user: User) => {
                          this._userBehaviorSubject.next(user);
                      })
                  )
                : this._getUser().pipe(
                      tap((user: User) => {
                          this._userBehaviorSubject.next(user);
                      }),
                      take(1)
                  );
        }
    }

    updateUser(): void {
        if (this.isCrowdsourcedUser) {
            this._getCrowdsourcedUser(this.currentlyRunningStudyId)
                .pipe(take(1))
                .subscribe(
                    (crowdsourcedUser) => {
                        const user: User = {
                            id: 0,
                            email: crowdsourcedUser.participantId,
                            role: Role.PARTICIPANT,
                            createdAt: crowdsourcedUser.registerDate,
                            changePasswordRequired: false,
                            lang: SupportedLangs.NONE,
                        };
                        this._userBehaviorSubject.next(user);
                    },
                    (err) => {
                        throw new Error(err.message);
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
                        this._userBehaviorSubject.next(null);
                        throw new Error(err.message);
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
                observe: 'response',
            })
            .pipe(map((res) => res as string));
    }

    registerUser(email: string, password: string, role?: Role): Observable<HttpResponse<any>> {
        const obj = {
            email: email,
            password: password,
        };
        if (role) obj['role'] = role;

        return this.http.post<HttpResponse<any>>(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}`, obj, {
            observe: 'response',
        });
    }

    patchUser(user: User): Observable<User> {
        return this.http.patch<User>(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}/${user.id}`, user).pipe(
            tap((user) => {
                this._userBehaviorSubject.next(user);
            })
        );
    }

    getCrowdsourcedUsersByStudyId(studyId: number): Observable<CrowdsourcedUser[]> {
        return this.http.get<CrowdsourcedUser[]>(
            `${environment.apiBaseURL}${this.CROWDSOURCED_USERS_RESOURCE_PATH}/${studyId}`
        );
    }

    changePassword(email: string, temporaryPassword: string, newPassword: string): Observable<any> {
        return this.http.post(
            `${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}/changepassword`,
            {
                email,
                temporaryPassword,
                newPassword,
            },
            { observe: 'response' }
        );
    }

    registerCrowdsourcedUser(participantId: string, studyId: number, lang: SupportedLangs) {
        const crowdsourcedUser: CrowdsourcedUser = {
            participantId,
            studyId,
            registerDate: this.timerService.getCurrentTimestamp(),
            completionCode: '',
            lang,
        };

        return this.http.post<CrowdsourcedUser>(
            `${environment.apiBaseURL}${this.CROWDSOURCED_USERS_RESOURCE_PATH}`,
            crowdsourcedUser
        );
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

    clearService() {
        if (this._guestsSubject.value) {
            this._guestsSubject.next(null);
        }
        if (this._userBehaviorSubject.value) {
            this._userBehaviorSubject.next(null);
        }
    }
}
