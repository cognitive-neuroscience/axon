import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Role, SupportedLangs } from 'src/app/models/enums';
import { Organization } from 'src/app/models/Organization';
import { AuthService } from 'src/app/services/auth.service';
import { ClearanceService } from 'src/app/services/clearance.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
    ADMIN_STUDIES_ROUTE = `/admin-dashboard/studies`;
    ADMIN_COMPONENTS_ROUTE = `/admin-dashboard/components`;
    ADMIN_USERS_ROUTE = `/admin-dashboard/users`;

    ORG_MEMBER_STUDIES_ROUTE = `/organization-member-dashboard/studies`;
    ORG_MEMBER_COMPONENTS_ROUTE = `/organization-member-dashboard/components`;

    PARTICIPANT_STUDIES_ROUTE = `/participant-dashboard/studies`;
    PARTICIPANT_PROFILE_ROUTE = `/participant-dashboard/profile`;

    get showAdminNavbar(): boolean {
        return this.userStateService.userIsAdmin;
    }

    get showOrgMemberNavbar(): boolean {
        return this.userStateService.userIsOrgMember || this.userStateService.userIsGuest;
    }

    get role(): string {
        switch (this.userStateService.userValue?.role) {
            case Role.ADMIN:
                return '(ADMIN)';
            case Role.GUEST:
                return '(GUEST)';
            case Role.ORGANIZATION_MEMBER:
                return '(MEMBER)';
            case Role.PARTICIPANT:
                return '(PARTICIPANT)';
            default:
                return '';
        }
    }

    get showParticipantNavbar(): boolean {
        return this.userStateService.userIsParticipant;
    }

    get isAdmin(): boolean {
        return this.userStateService.userIsAdmin;
    }

    get organization(): Organization {
        return this.userStateService.userOrganization;
    }

    constructor(
        private clearanceService: ClearanceService,
        private userService: UserService,
        private authService: AuthService,
        private loaderService: LoaderService,
        private snackbarService: SnackbarService,
        private translateService: TranslateService,
        private userStateService: UserStateService
    ) {}

    ngOnInit(): void {}

    handleLanguageSwitch() {
        this.loaderService.showLoader();
        const newLang = this.currentLang === SupportedLangs.FR ? SupportedLangs.EN : SupportedLangs.FR;

        this.userStateService
            .getOrUpdateUserState()
            .pipe(
                mergeMap((user) => {
                    return this.userService.updateUser({ ...user, lang: newLang });
                })
            )
            .subscribe(
                (_res) => {
                    this.translateService.use(newLang);
                },
                (_err) => {
                    this.snackbarService.openErrorSnackbar('There was an error changing the language');
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
    }

    get currentLang(): string {
        return this.translateService.currentLang;
    }

    logout() {
        this.clearanceService.clearServices();
        this.authService.logout();
    }
}
