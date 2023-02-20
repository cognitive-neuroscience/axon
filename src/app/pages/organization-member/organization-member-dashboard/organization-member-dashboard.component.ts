import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { UserStateService } from 'src/app/services/user-state-service';

@Component({
    selector: 'app-organization-member-dashboard',
    templateUrl: './organization-member-dashboard.component.html',
    styleUrls: ['./organization-member-dashboard.component.scss'],
})
export class OrganizationMemberDashboardComponent implements OnInit {
    constructor(private userStateService: UserStateService, private translateService: TranslateService) {}

    get userName(): string {
        return this.userStateService.userValue?.name || '';
    }

    ngOnInit() {
        // subscribe noop because it is lazy
        this.userStateService
            .getOrUpdateUserState()
            .pipe(
                tap((user) => {
                    if (user) this.translateService.use(user.lang);
                })
            )
            .subscribe(() => {});
    }
}
