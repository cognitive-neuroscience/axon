import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { SupportedLangs } from 'src/app/models/enums';
import { User } from 'src/app/models/Login';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
import { UserService } from 'src/app/services/user.service';
import { LanguageDialogComponent } from './language-dialog/language-dialog.component';

@Component({
    selector: 'app-participant-dashboard',
    templateUrl: './participant-dashboard.component.html',
    styleUrls: ['./participant-dashboard.component.scss'],
})
export class ParticipantDashboardComponent implements OnInit {
    constructor(
        private sessionStorageService: SessionStorageService,
        private userService: UserService,
        private dialog: MatDialog,
        private translateService: TranslateService
    ) {}

    ngOnInit(): void {
        const studyId = parseInt(this.sessionStorageService.getStudyIdFromSessionStorage());
        const userHasValueObs = this.userService.userHasValue ? of(null) : this.userService.updateUserAsync();

        userHasValueObs
            .pipe(
                mergeMap((_res) => {
                    // present the user with the choice of lang, save the preference in the db and locally
                    // Otherwise just use the one that is set if it exists
                    if (this.userService.user.lang === SupportedLangs.NONE) {
                        return this.openLanguageDialog().pipe(
                            mergeMap((lang) => {
                                this.translateService.use(lang);
                                return this.userService.updateUserDetails({
                                    ...this.userService.user,
                                    lang: lang,
                                });
                            }),
                            mergeMap((_res) => this.userService.updateUserAsync())
                        );
                    }
                    this.translateService.use(this.userService.user.lang);
                    return of(null);
                }),
                mergeMap((_: User | null) => {
                    // register the participant for the given study saved in session storage if it exists
                    return studyId
                        ? this.userService.registerParticipantForStudy(this.userService.user, studyId)
                        : of(null);
                }),
                take(1)
            )
            .subscribe(
                (_res) => {
                    this.sessionStorageService.clearSessionStorage();
                    this.userService.updateStudyUsers();
                },
                (err) => {
                    console.log(err);

                    console.warn('user may have registered for this study already');
                    this.sessionStorageService.clearSessionStorage();
                }
            );
    }

    openLanguageDialog(): Observable<SupportedLangs> {
        return this.dialog.open(LanguageDialogComponent, { disableClose: true }).afterClosed().pipe(take(1));
    }
}
