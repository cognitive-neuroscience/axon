import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { StudyUser, StudyUserSummary } from '../models/StudyUser';
import { User } from '../models/User';
import { CanClear } from './clearance.service';
import { TimerService } from './timer.service';
import { UserStateService } from './user-state-service';

@Injectable({
    providedIn: 'root',
})
export class StudyUserService implements CanClear {
    private readonly STUDY_USERS_RESOURCE_PATH = '/studyusers';

    private _studyUsersSubject: BehaviorSubject<StudyUser[]>;
    // get studyUsers(): Observable<StudyUser[]> {
    //     return this._studyUsersSubject.asObservable();
    // }'
    get studyUsers(): StudyUser[] {
        return this.hasStudyUsers ? this._studyUsersSubject.value : [];
    }

    get hasStudyUsers(): boolean {
        return this._studyUsersSubject.value !== null;
    }

    constructor(
        private http: HttpClient,
        private timerService: TimerService,
        private userStateService: UserStateService
    ) {
        this._studyUsersSubject = new BehaviorSubject(null);
    }

    getOrUpdateStudyUsers(forceUpdate: boolean = false): Observable<StudyUser[] | null> {
        if (!this.userStateService.userHasValue) {
            return of(null);
        }

        if (this.hasStudyUsers && !forceUpdate) {
            return of(this.studyUsers);
        }

        return this._getStudyUsers(this.userStateService.currentlyLoggedInUserId).pipe(
            take(1),
            tap((studyUsers: StudyUser[]) => {
                this._studyUsersSubject.next(studyUsers);
            })
        );
    }

    updateStudyUsersState(studyUsers: StudyUser[]) {
        this._studyUsersSubject.next(studyUsers);
    }

    // register a given account holding participant with a study id
    registerParticipantForStudy(user: User, studyId: number): Observable<any> {
        const studyUser: StudyUser = {
            userId: user.id,
            studyId: studyId,
            completionCode: '',
            registerDate: this.timerService.getCurrentTimestamp(),
            dueDate: {
                Valid: false,
                Time: this.timerService.getCurrentTimestamp(),
            }, // nullable time
            currentTaskIndex: 0,
            hasAcceptedConsent: false,
            lang: user.lang,
        };

        return this.http.post(`${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}`, studyUser);
    }

    updateStudyUser(studyUser: StudyUser): Observable<StudyUser> {
        return this.http
            .patch<StudyUser>(
                `${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}/${studyUser.userId}/${studyUser.studyId}`,
                studyUser
            )
            .pipe(
                tap((receivedStudyUser) => {
                    const updatedStudyUsers = [...this.studyUsers];
                    const updatedStudyUserIndex = updatedStudyUsers.findIndex(
                        (updatedStudyUser) =>
                            updatedStudyUser.userId === receivedStudyUser.userId &&
                            updatedStudyUser.studyId === receivedStudyUser.studyId
                    );
                    if (updatedStudyUserIndex < 0) return;
                    updatedStudyUsers[updatedStudyUserIndex] = receivedStudyUser;
                    this.updateStudyUsersState(updatedStudyUsers);
                })
            );
    }

    getStudyUsersForStudy(studyId: number): Observable<StudyUser[]> {
        return this.http.get<StudyUser[]>(`${environment.apiBaseURL}/studies/${studyId}/studyusers`);
    }

    getStudyUserSummary(): Observable<StudyUserSummary[]> {
        return this.http.get<StudyUserSummary[]>(`${environment.apiBaseURL}/summary/studyusersummary`);
    }

    clearService() {
        this.updateStudyUsersState(null);
    }

    private _getStudyUsers(userId: string): Observable<StudyUser[]> {
        return this.http.get<StudyUser[]>(`${environment.apiBaseURL}/users/${userId}/studyusers`);
    }
}
