import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { mergeMap, take, tap } from 'rxjs/operators';
import { SupportedLangs } from 'src/app/models/enums';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { LanguageDialogComponent } from '../../participant/participant-dashboard/language-dialog/language-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-organization-member-dashboard',
    templateUrl: './organization-member-dashboard.component.html',
    styleUrls: ['./organization-member-dashboard.component.scss'],
})
export class OrganizationMemberDashboardComponent implements OnInit {
    constructor(
        private userStateService: UserStateService,
        private translateService: TranslateService,
        private loaderService: LoaderService,
        private dialog: MatDialog,
        private userService: UserService
    ) {}

    get userName(): string {
        return this.userStateService.userValue?.name || '';
    }

    openLanguageDialog(): Observable<SupportedLangs> {
        return this.dialog.open(LanguageDialogComponent, { disableClose: true }).afterClosed().pipe(take(1));
    }

    ngOnInit() {
        // subscribe noop because it is lazy
        this.userStateService
            .getOrUpdateUserState()
            .pipe(
                mergeMap(() => this.userStateService.getOrUpdateUserState(true)),
                mergeMap((res) => {
                    this.loaderService.hideLoader();
                    return res?.lang === SupportedLangs.NONE
                        ? this.openLanguageDialog().pipe(
                              mergeMap((lang) => this.userService.updateUser({ ...res, lang }))
                          )
                        : of(res);
                }),
                tap((user) => {
                    this.translateService.use(user?.lang ? user.lang : SupportedLangs.EN);
                })
            )
            .subscribe(() => {});
    }
}
