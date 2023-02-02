import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { SupportedLangs } from '../models/enums';
import { TimerService } from './timer.service';
import { CrowdsourcedUser } from '../models/User';
import { tap } from 'rxjs/operators';
import { SessionStorageService } from './sessionStorage.service';

@Injectable({
    providedIn: 'root',
})
export class CrowdSourcedUserService {
    private readonly CROWDSOURCED_USERS_RESOURCE_PATH = '/crowdsourcedusers';

    constructor(
        private http: HttpClient,
        private timerService: TimerService,
        private sessionStorageService: SessionStorageService
    ) {}

    setComplete(crowdSourcedUserId: string, studyId: number): Observable<CrowdsourcedUser> {
        return this.http.patch<CrowdsourcedUser>(
            `${environment.apiBaseURL}${this.CROWDSOURCED_USERS_RESOURCE_PATH}/${crowdSourcedUserId}/${studyId}/complete`,
            { observe: 'response' }
        );
    }

    getCrowdsourcedUsersByStudyId(studyId: number): Observable<CrowdsourcedUser[]> {
        return this.http.get<CrowdsourcedUser[]>(`${environment.apiBaseURL}/studies/${studyId}/crowdsourcedusers`);
    }

    getCrowdSourcedUserByCrowdSourcedUserAndStudyId(
        crowdSourcedUserId: string,
        studyId: number
    ): Observable<CrowdsourcedUser> {
        return this.http.get<CrowdsourcedUser>(
            `${environment.apiBaseURL}${this.CROWDSOURCED_USERS_RESOURCE_PATH}/${crowdSourcedUserId}/${studyId}`
        );
    }

    createCrowdSourcedUserAndLogin(participantId: string, studyId: number, lang: SupportedLangs) {
        const crowdsourcedUser: CrowdsourcedUser = {
            participantId,
            studyId,
            registerDate: this.timerService.getCurrentTimestamp(),
            completionCode: '',
            lang,
        };

        return this.http
            .post<CrowdsourcedUser>(
                `${environment.apiBaseURL}${this.CROWDSOURCED_USERS_RESOURCE_PATH}`,
                crowdsourcedUser
            )
            .pipe(
                tap((crowdSourceUser) =>
                    this.sessionStorageService.setUserIdInSessionStorage(crowdSourceUser.participantId)
                )
            );
    }
}
