import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { tap, map, take, subscribeOn } from 'rxjs/operators';
import { UserStateService } from 'src/app/services/user-state-service';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
    constructor(private userStateService: UserStateService, private translateService: TranslateService) {}

    private _subscriptions: Subscription[] = [];

    get userName(): string {
        return this.userStateService.userValue?.name || '';
    }

    ngOnInit() {
        // subscribe noop because it is lazy
        const sub = this.userStateService
            .getOrUpdateUserState()
            .pipe(
                tap((user) => {
                    if (user) this.translateService.use(user.lang);
                })
            )
            .subscribe(() => {});
        this._subscriptions.push(sub);
    }

    ngOnDestroy() {
        for (const sub of this._subscriptions) sub.unsubscribe();
    }
}
