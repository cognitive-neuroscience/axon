import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminRouteNames, ParticipantRouteNames, Role, RouteNames } from 'src/app/models/enums';
import { User } from 'src/app/models/Login';
import { AuthService } from 'src/app/services/auth.service';
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
        return this.user.pipe(map((user) => (user ? user.role === Role.ADMIN || user.role === Role.GUEST : false)));
    }

    get isAdmin(): Observable<boolean> {
        return this.userService.userIsAdmin;
    }

    user: Observable<User>;

    constructor(
        private router: Router,
        private userService: UserService,
        private authService: AuthService,
        private loaderService: LoaderService,
        private snackbarService: SnackbarService
    ) {
        this.user = new Observable();
    }

    ngOnInit(): void {
        this.user = this.userService.userAsync;
        if (!this.userService.userHasValue) this.userService.updateUser();
    }

    logout() {
        this.loaderService.showLoader();
        this.authService.logout().subscribe(
            () => {
                this.loaderService.hideLoader();
                this.router.navigate([RouteNames.LANDINGPAGE_LOGIN_BASEROUTE]);
                this.snackbarService.openSuccessSnackbar('Successfully logged out');
            },
            (err) => {
                this.loaderService.hideLoader();
                this.router.navigate([RouteNames.LANDINGPAGE_LOGIN_BASEROUTE]);
                this.snackbarService.openErrorSnackbar('Logged out but encountered issues clearing cookies');
            }
        );
    }
}
