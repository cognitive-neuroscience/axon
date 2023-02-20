import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import { Role } from '../models/enums';
import { TimerService } from './timer.service';
import { CanClear } from './clearance.service';
import { User } from '../models/User';
import { UserStateService } from './user-state-service';
import { SnackbarService } from './snackbar/snackbar.service';
import { HttpStatus } from '../models/Auth';

@Injectable({
    providedIn: 'root',
})
export class UserService implements CanClear {
    private readonly USERS_RESOURCE_PATH = '/users';

    private _usersSubject: BehaviorSubject<User[]>;

    get usersValue(): User[] {
        return this.hasUsers ? this._usersSubject.value : [];
    }

    get hasUsers(): boolean {
        return this._usersSubject.value !== null;
    }

    getOrUpdateUsers(forceUpdate = false): Observable<User[] | null> {
        if (
            !this.userStateService.userHasValue ||
            (!this.userStateService.userIsAdmin && !this.userStateService.userIsOrgMember)
        ) {
            return of([]);
        }

        if (this.hasUsers && !forceUpdate) return of(this.usersValue);

        return this._getUsers(this.userStateService.userOrganization.id).pipe(
            take(1),
            tap((users) => this.updateUsersState(users))
        );
    }

    updateUsersState(users: User[]) {
        this._usersSubject.next(users);
    }

    constructor(
        private http: HttpClient,
        private timerService: TimerService,
        private userStateService: UserStateService,
        private snackbarService: SnackbarService
    ) {
        this._usersSubject = new BehaviorSubject(null);
    }

    // we cannot delete most users (except guests)
    deleteGuest(user: User): Observable<any> {
        if (user.role !== Role.GUEST) {
            this.snackbarService.openErrorSnackbar(
                'Cannot delete users other than guests - please contact the developer for more info'
            );
            return;
        }
        return this.http.delete<HttpStatus>(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}/${user.id}`).pipe(
            tap((_res) => {
                const usersUpdate = [...this.usersValue];
                const deletedUserIndex = usersUpdate.findIndex((userUpdate) => userUpdate.id === user.id);
                if (deletedUserIndex < 0) return;

                usersUpdate.splice(deletedUserIndex, 1);
                this.updateUsersState(usersUpdate);
            })
        );
    }

    createUser(user: User): Observable<any> {
        return this.http
            .post<HttpStatus>(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}`, user)
            .pipe(mergeMap(() => this.getOrUpdateUsers(true)));
    }

    updateUser(user: User): Observable<User> {
        return this.http
            .patch<User>(`${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}/${user.id}`, user)
            .pipe(tap((user) => this.userStateService.updateUserState(user)));
    }

    updateUserPassword(email: string, temporaryPassword: string, newPassword: string): Observable<any> {
        return this.http.put(
            `${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}/password`,
            {
                email,
                temporaryPassword,
                newPassword,
            },
            { observe: 'response' }
        );
    }

    sendForgotPasswordEmail(email: string): Observable<boolean> {
        return this.http
            .put<HttpResponse<any>>(
                `${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}/forgotpassword`,
                { email: email },
                { observe: 'response' }
            )
            .pipe(map((res) => res.ok));
    }

    private _getUsers(organizationId: number) {
        return this.http.get<User[]>(
            `${environment.apiBaseURL}${this.USERS_RESOURCE_PATH}?organizationId=${organizationId}`
        );
    }

    clearService() {
        this._usersSubject.next(null);
    }
}
