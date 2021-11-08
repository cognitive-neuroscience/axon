import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/models/enums';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
    constructor(private router: Router) {}

    ngOnInit(): void {}

    routeToLogin(): void {
        this.router.navigate([`${RouteNames.LANDINGPAGE_LOGIN_BASEROUTE}`]);
    }

    routeToRegister(): void {
        this.router.navigate([`${RouteNames.LANDINGPAGE_REGISTER_BASEROUTE}`]);
    }
}
