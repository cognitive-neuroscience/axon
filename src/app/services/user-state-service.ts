import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { Role, SupportedLangs } from '../models/enums';
import { CanClear } from './clearance.service';
import { SessionStorageService } from './sessionStorage.service';
import { User } from '../models/User';
import { CrowdSourcedUserService } from './crowdsourced-user.service';
import { Organization } from '../models/Organization';
import { AuthService } from './auth.service';
import { SnackbarService } from './snackbar/snackbar.service';

@Injectable({
    providedIn: 'root',
})
export class UserStateService implements CanClear {
    private readonly USERS_RESOURCE_PATH = '/users';

    get userValue(): null | User {
        return this._userBehaviorSubject.value;
    }

    get userHasValue(): boolean {
        return this._userBehaviorSubject.value !== null;
    }

    get userOrganization(): Organization | null {
        return this.userHasValue ? this.userValue.organization : null;
    }

    get userIsAdmin(): boolean {
        return this.userHasValue ? this.userValue.role === Role.ADMIN : false;
    }

    get userIsOrgMember(): boolean {
        return this.userHasValue ? this.userValue.role === Role.ORGANIZATION_MEMBER : false;
    }

    get userIsParticipant(): boolean {
        return this.userHasValue ? this.userValue.role === Role.PARTICIPANT : false;
    }

    get userIsGuest(): boolean {
        return this.userHasValue ? this.userValue.role === Role.GUEST : false;
    }

    get isCrowdsourcedUser(): boolean {
        return this.sessionStorageService.getIsCrowdsourcedUser();
    }

    get currentlyRunningStudyId(): number {
        return parseInt(this.sessionStorageService.getCurrentlyRunningStudyIdInSessionStorage());
    }

    get currentlyLoggedInUserId() {
        return this.sessionStorageService.getUserIdInSessionStorage();
    }

    private _userBehaviorSubject: BehaviorSubject<null | User>;

    constructor(
        private http: HttpClient,
        private sessionStorageService: SessionStorageService,
        private crowdSourcedUserService: CrowdSourcedUserService,
        private authService: AuthService,
        private snackbarService: SnackbarService
    ) {
        this._userBehaviorSubject = new BehaviorSubject(null);
    }

    // this function makes the request if no value is present, or a flag can be passed to force the update
    getOrUpdateUserState(forceUpdate = false): Observable<User | null> {
        if (!this.currentlyLoggedInUserId) {
            this.snackbarService.openErrorSnackbar(
                'Login session ID not found. Please contact sharplab.neuro@mcgill.ca'
            );
            this.authService.logout(false);
            return of(null);
        }

        if (this.userHasValue && !forceUpdate) return of(this.userValue);

        let obs: Observable<User>;

        if (this.isCrowdsourcedUser) {
            if (!this.currentlyRunningStudyId) {
                this.snackbarService.openErrorSnackbar(
                    'Could not find ID for currently running study. Please contact sharplab.neuro@mcgill.ca'
                );
            }
            obs = this.crowdSourcedUserService
                .getCrowdSourcedUserByCrowdSourcedUserAndStudyId(
                    this.currentlyLoggedInUserId,
                    this.currentlyRunningStudyId
                )
                .pipe(
                    map((crowdsourcedUser) => ({
                        id: 0,
                        name: '',
                        organization: null,
                        email: crowdsourcedUser.participantId,
                        role: Role.PARTICIPANT,
                        createdAt: crowdsourcedUser.registerDate,
                        changePasswordRequired: false,
                        lang: SupportedLangs.NONE,
                    }))
                );
        } else {
            const userId = parseInt(this.currentlyLoggedInUserId);
            obs = this._getUser(userId);
        }
        return obs.pipe(
            take(1),
            tap((user) => this.updateUserState(user))
        );
    }

    updateUserState(user: User) {
        this._userBehaviorSubject.next(user);
    }

    private _getUser(userId: number) {
        return this.http.get<User>(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}/${userId}`);
    }

    clearService() {
        this.updateUserState(null);
    }
}
