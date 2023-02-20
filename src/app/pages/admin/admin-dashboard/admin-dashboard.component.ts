import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { tap, map, take, subscribeOn, catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserStateService } from 'src/app/services/user-state-service';

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
        private snackbarService: SnackbarService
    ) {}

    private _subscriptions: Subscription[] = [];

    get userName(): string {
        return this.userStateService.userValue?.name || '';
    }

    ngOnInit() {
        console.log('here');
        // subscribe noop because it is lazy
        const sub = this.userStateService
            .getOrUpdateUserState()
            .pipe(
                catchError((err) => throwError(err)),
                tap((user) => {
                    if (user) this.translateService.use(user.lang);
                })
            )
            .subscribe(
                (res) => {
                    // noop
                },
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
