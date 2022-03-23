import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { AdminRouteNames, ParticipantRouteNames, Role, RouteNames, SupportedLangs } from 'src/app/models/enums';
import { AuthService } from 'src/app/services/auth.service';
import { ClearanceService } from 'src/app/services/clearance.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
    ADMIN_STUDIES_ROUTE = `/${AdminRouteNames.DASHBOARD_BASEROUTE}/${AdminRouteNames.STUDIES_SUBROUTE}`;
    ADMIN_COMPONENTS_ROUTE = `/${AdminRouteNames.DASHBOARD_BASEROUTE}/${AdminRouteNames.COMPONENTS_SUBROUTE}`;
    ADMIN_GUESTS_ROUTE = `/${AdminRouteNames.DASHBOARD_BASEROUTE}/${AdminRouteNames.GUESTS_SUBROUTE}`;

    PARTICIPANT_STUDIES_ROUTE = `/${ParticipantRouteNames.DASHBOARD_BASEROUTE}/${ParticipantRouteNames.STUDIES_SUBROUTE}`;
    PARTICIPANT_PROFILE_ROUTE = `/${ParticipantRouteNames.DASHBOARD_BASEROUTE}/${ParticipantRouteNames.PROFILE_SUBROUTE}`;

    get showAdminDashboard(): Observable<boolean> {
        return this.userService.userAsync.pipe(
            map((user) => (user ? user.role === Role.ADMIN || user.role === Role.GUEST : false))
        );
    }

    get isAdmin(): Observable<boolean> {
        return this.userService.userIsAdmin;
    }

    constructor(
        private router: Router,
        private userService: UserService,
        private authService: AuthService,
        private loaderService: LoaderService,
        private snackbarService: SnackbarService,
        private translateService: TranslateService,
        private clearanceService: ClearanceService
    ) {}

    ngOnInit(): void {}

    handleLanguageSwitch() {
        const newLang = this.currentLang === SupportedLangs.FR ? SupportedLangs.EN : SupportedLangs.FR;

        this.userService
            .getUser()
            .pipe(
                mergeMap((user) => {
                    return this.userService.patchUser({ ...user, lang: newLang });
                }),
                mergeMap((_res) => this.userService.getUser(true))
            )
            .subscribe(
                (_res) => {
                    this.translateService.use(newLang);
                },
                (_err) => {
                    this.snackbarService.openErrorSnackbar('There was an error changing the language');
                }
            );
    }

    get currentLang(): string {
        return this.translateService.currentLang;
    }

    logout() {
        this.loaderService.showLoader();
        this.clearanceService.clearServices();
        this.authService
            .logout()
            .subscribe(
                () => {
                    this.router.navigate([RouteNames.LANDINGPAGE_LOGIN_BASEROUTE]);
                    this.snackbarService.openSuccessSnackbar('Successfully logged out');
                },
                (_err) => {
                    this.router.navigate([RouteNames.LANDINGPAGE_LOGIN_BASEROUTE]);
                    this.snackbarService.openErrorSnackbar('Logged out but encountered issues clearing cookies');
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
    }
}
