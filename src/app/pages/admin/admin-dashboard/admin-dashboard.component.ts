import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, mergeMap, take, tap } from 'rxjs/operators';
import { SupportedLangs } from 'src/app/models/enums';
import { getOrganizationSupportedLangs, shouldPromptForOrganizationLang } from 'src/app/models/Organization';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { LocalStorageService } from 'src/app/services/localStorageService.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { UserService } from 'src/app/services/user.service';
import { LanguageDialogComponent } from '../../participant/participant-dashboard/language-dialog/language-dialog.component';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
    constructor(
        private userStateService: UserStateService,
        private translateService: TranslateService,
        private authService: AuthService,
        private snackbarService: SnackbarService,
        private dialog: MatDialog,
        private userService: UserService,
        private loaderService: LoaderService,
        private localStorageService: LocalStorageService
    ) {}

    private _subscriptions: Subscription[] = [];

    get userName(): string {
        return this.userStateService.userValue?.name || '';
    }

    openLanguageDialog(supportedLangs: SupportedLangs[]): Observable<SupportedLangs> {
        return this.dialog
            .open(LanguageDialogComponent, { disableClose: true, data: { supportedLangs } })
            .afterClosed()
            .pipe(take(1));
    }

    ngOnInit() {
        const sub = this.userStateService
            .getOrUpdateUserState()
            .pipe(
                mergeMap(() => this.userStateService.getOrUpdateUserState(true)),
                mergeMap((res) => {
                    this.loaderService.hideLoader();
                    const selectedLang = this.localStorageService.getPreferredLangInLocalStorage();
                    return res && shouldPromptForOrganizationLang(res.lang, selectedLang, res.organization)
                        ? this.openLanguageDialog(getOrganizationSupportedLangs(res.organization)).pipe(
                              mergeMap((lang) => this.userService.updateUser({ ...res, lang }))
                          )
                        : of(res);
                }),
                tap((user) => {
                    this.translateService.use(user?.lang ? user.lang : SupportedLangs.EN);
                }),
                catchError((err) => throwError(err))
            )
            .subscribe(
                () => {},
                (err) => {
                    if (err.status === 401) {
                        this.snackbarService.openErrorSnackbar('forbidden');
                        this.authService.logout(false);
                    }
                }
            );
        this._subscriptions.push(sub);
    }

    ngOnDestroy() {
        for (const sub of this._subscriptions) sub.unsubscribe();
    }
}
