import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { StudyUser, StudyUserSummary, User } from '../models/Login';
import { CanClear } from './clearance.service';
import { TimerService } from './timer.service';

@Injectable({
    providedIn: 'root',
})
export class StudyUserService implements CanClear {
    private readonly STUDY_USERS_RESOURCE_PATH = '/studyusers';

    private _studyUsersSubject: BehaviorSubject<StudyUser[]>;
    get studyUsers(): Observable<StudyUser[]> {
        return this._studyUsersSubject.asObservable();
    }

    get hasStudyUsers(): boolean {
        return this._studyUsersSubject.value !== null;
    }

    constructor(private http: HttpClient, private timerService: TimerService) {
        this._studyUsersSubject = new BehaviorSubject(null);
    }

    getStudyUsers(forceUpdate: boolean = false): Observable<StudyUser[]> {
        return this.hasStudyUsers && !forceUpdate
            ? this.studyUsers.pipe(take(1))
            : this._getStudyUsers().pipe(
                  tap((studyUsers: StudyUser[]) => {
                      this._studyUsersSubject.next(studyUsers);
                  }),
                  take(1)
              );
    }

    // register a given account holding participant with a study id
    registerParticipantForStudy(user: User, studyId: number): Observable<any> {
        const studyUser: StudyUser = {
            userId: user.id,
            studyId: studyId,
            completionCode: '',
            registerDate: this.timerService.getCurrentTimestamp(),
            dueDate: {
                valid: false,
                time: this.timerService.getCurrentTimestamp(),
            }, // nullable time
            currentTaskIndex: 0,
            hasAcceptedConsent: false,
            lang: user.lang,
        };

        return this.http.post(`${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}`, studyUser);
    }

    updateStudyUser(studyUser: StudyUser): Observable<StudyUser> {
        return this.http.patch<StudyUser>(`${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}`, studyUser);
    }

    incrementStudyUserTaskIndex(studyUser: StudyUser): Observable<HttpResponse<StudyUser>> {
        return this.http.patch<StudyUser>(
            `${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}/increment`,
            studyUser,
            { observe: 'response' }
        );
    }

    getStudyUsersForStudy(studyId: number): Observable<StudyUser[]> {
        return this.http.get<StudyUser[]>(`${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}/${studyId}`);
    }

    getStudyUserSummary(): Observable<StudyUserSummary[]> {
        return this.http.get<StudyUserSummary[]>(`${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}/summary`);
    }

    clearService() {
        if (this._studyUsersSubject.value) {
            this._studyUsersSubject.next(null);
        }
    }

    private _getStudyUsers(): Observable<StudyUser[]> {
        return this.http.get<StudyUser[]>(`${environment.apiBaseURL}${this.STUDY_USERS_RESOURCE_PATH}/studies`);
    }
}
