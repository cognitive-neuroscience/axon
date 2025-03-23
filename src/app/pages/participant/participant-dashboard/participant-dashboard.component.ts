import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, mergeMap, take, tap } from 'rxjs/operators';
import { SupportedLangs } from 'src/app/models/enums';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { UserService } from 'src/app/services/user.service';
import { LanguageDialogComponent } from './language-dialog/language-dialog.component';

@Component({
    selector: 'app-participant-dashboard',
    templateUrl: './participant-dashboard.component.html',
    styleUrls: ['./participant-dashboard.component.scss'],
})
export class ParticipantDashboardComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];
    isLoading: boolean = false;

    constructor(
        private sessionStorageService: SessionStorageService,
        private userService: UserService,
        private studyUserService: StudyUserService,
        private dialog: MatDialog,
        private translateService: TranslateService,
        private loaderService: LoaderService,
        private userStateService: UserStateService,
        private authService: AuthService,
        private snackbarService: SnackbarService
    ) {}

    ngOnInit(): void {
        const studyId = parseInt(this.sessionStorageService.getStudyIdToRegisterInSessionStorage());
        this.isLoading = true;

        const obs = this.userStateService
            .getOrUpdateUserState()
            .pipe(
                mergeMap((res) =>
                    res?.lang === SupportedLangs.NONE
                        ? this.openLanguageDialog().pipe(
                              mergeMap((lang) => this.userService.updateUser({ ...res, lang }))
                          )
                        : of(res)
                ),
                tap((user) => this.translateService.use(user?.lang)),
                mergeMap((user) => {
                    this.loaderService.showLoader();
                    // register the participant for the given study saved in session storage if it exists
                    return studyId ? this.studyUserService.registerParticipantForStudy(user, studyId) : of(null);
                }),
                // if 409 (conflict) then we dont want an error
                catchError((err) => (err.status === 409 ? of(null) : throwError(err))),
                mergeMap((_res) => {
                    // force update as sometimes the retrieved studyUsers value is cached elsewhere
                    // and does not reflect our recent call to registerParticipantForStudy
                    return this.studyUserService.getOrUpdateStudyUsers(true);
                })
            )
            .subscribe(
                (_res) => {
                    // noop
                },
                (err) => {
                    if (err.status === 401) {
                        this.snackbarService.openErrorSnackbar('forbidden');
                        this.authService.logout(false);
                    } else {
                        console.error(err);
                    }
                }
            )
            .add(() => {
                // this.sessionStorageService.removeStudyIdToRegisterInSessionStorage();
                this.isLoading = false;
                this.loaderService.hideLoader();
            });

        this.subscriptions.push(obs);
    }

    openLanguageDialog(): Observable<SupportedLangs> {
        return this.dialog.open(LanguageDialogComponent, { disableClose: true }).afterClosed().pipe(take(1));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
