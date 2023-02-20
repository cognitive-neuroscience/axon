import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { SessionStorageService } from './sessionStorage.service';
import { TimerService } from './timer.service';
import { User } from '../models/User';
import { tap } from 'rxjs/operators';
import { LoaderService } from './loader/loader.service';
import { SnackbarService } from './snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { SupportedLangs } from '../models/enums';
import { Router } from '@angular/router';
import { LocalStorageService } from './localStorageService.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly AUTH_RESOURCE_PATH = '/auth';

    constructor(
        private http: HttpClient,
        private timerService: TimerService,
        private loaderService: LoaderService,
        private snackbarService: SnackbarService,
        private translateService: TranslateService,
        private router: Router,
        private localStorageService: LocalStorageService,
        private sessionStorageService: SessionStorageService
    ) {}

    login(email: string, password: string): Observable<User> {
        const obj = {
            email: email,
            password: password,
        };
        return this.http
            .post<User>(`${environment.apiBaseURL}${this.AUTH_RESOURCE_PATH}/login`, obj)
            .pipe(tap((user) => this.localStorageService.setUserIdInLocalStorage(user.id.toString())));
    }

    getCSRF(): Observable<any> {
        return this.http.get<HttpResponse<any>>(`${environment.apiBaseURL}${this.AUTH_RESOURCE_PATH}/csrf`, {
            observe: 'response',
        });
    }

    logout(showLogoutMessage = false) {
        this.loaderService.showLoader();
        this.localStorageService.removeUserIdFromLocalStorage();
        this.sessionStorageService.clearSessionStorage(true);
        return this.http
            .delete<HttpResponse<any>>(`${environment.apiBaseURL}${this.AUTH_RESOURCE_PATH}/logout`)
            .subscribe(
                () => {
                    if (showLogoutMessage) {
                        this.snackbarService.openSuccessSnackbar(
                            this.translateService.currentLang === SupportedLangs.FR
                                ? 'Déconnecté'
                                : 'You are logged out'
                        );
                    }
                },
                (_err) => {
                    this.snackbarService.openErrorSnackbar('Logged out but encountered issues clearing cookies');
                }
            )
            .add(() => {
                this.router.navigate([`login`]);
                this.loaderService.hideLoader();
            });
    }

    loginTurker(id: string, expCode: string): Observable<HttpResponse<any>> {
        const obj = {
            id: id.trim(),
            code: expCode,
            registerDate: this.timerService.getCurrentTimestamp(),
        };
        return this.http.post<HttpResponse<any>>(`${environment.apiBaseURL}/login/turker`, obj, {
            observe: 'response',
        });
    }
}
