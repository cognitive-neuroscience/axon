import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, tap } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
    constructor(private userService: UserService, private translateService: TranslateService) {}

    ngOnInit() {
        // subscribe noop because it is lazy
        this.userService
            .updateUserAsync()
            .pipe(tap((user) => this.translateService.use(user.lang)))
            .subscribe(() => {});
    }
}
