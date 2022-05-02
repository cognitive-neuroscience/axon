import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, mergeMap, take } from 'rxjs/operators';
import { SupportedLangs } from 'src/app/models/enums';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { UserService } from 'src/app/services/user.service';
import { LanguageDialogComponent } from './language-dialog/language-dialog.component';

@Component({
    selector: 'app-participant-dashboard',
    templateUrl: './participant-dashboard.component.html',
    styleUrls: ['./participant-dashboard.component.scss'],
})
export class ParticipantDashboardComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];

    constructor(
        private sessionStorageService: SessionStorageService,
        private userService: UserService,
        private studyUserService: StudyUserService,
        private dialog: MatDialog,
        private translateService: TranslateService,
        private loaderService: LoaderService
    ) {}

    ngOnInit(): void {
        const studyId = parseInt(this.sessionStorageService.getStudyIdToRegisterFromSessionStorage());

        this.subscriptions.push(
            this.userService
                .getUser()
                .pipe(
                    mergeMap((res) => {
                        // present the user with the choice of lang, save the preference in the db and locally
                        // Otherwise just use the one that is set if it exists
                        if (res.lang === SupportedLangs.NONE) {
                            return this.openLanguageDialog().pipe(
                                mergeMap((lang) => {
                                    this.translateService.use(lang);
                                    return this.userService.patchUser({
                                        ...res,
                                        lang: lang,
                                    });
                                })
                            );
                        } else {
                            this.translateService.use(res.lang);
                            return of(null);
                        }
                    }),
                    mergeMap((_res) => this.userService.getUser()),
                    mergeMap((user) => {
                        this.loaderService.showLoader();
                        // register the participant for the given study saved in session storage if it exists
                        return studyId ? this.studyUserService.registerParticipantForStudy(user, studyId) : of(null);
                    }),
                    // if 409 (conflict) then we dont want an error
                    catchError((err) => (err.status === 409 ? of(null) : throwError(err))),
                    mergeMap((_res) => this.studyUserService.getStudyUsers())
                )
                .subscribe(
                    (_res) => {
                        // noop
                    },
                    (err) => {
                        console.error(err);
                    }
                )
                .add(() => {
                    this.sessionStorageService.clearSessionStorage(true);
                    this.loaderService.hideLoader();
                })
        );
    }

    openLanguageDialog(): Observable<SupportedLangs> {
        return this.dialog.open(LanguageDialogComponent, { disableClose: true }).afterClosed().pipe(take(1));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
