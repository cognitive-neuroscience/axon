import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/models/enums';

@Component({
    selector: 'app-not-allowed',
    templateUrl: './not-allowed.component.html',
    styleUrls: ['./not-allowed.component.scss'],
})
export class NotAllowedComponent implements OnInit {
    constructor(private router: Router) {}

    ngOnInit(): void {}

    routeToLogin(): void {
        this.router.navigate([`${RouteNames.LANDINGPAGE_LOGIN_BASEROUTE}`]);
    }

    routeToRegister(): void {
        this.router.navigate([`${RouteNames.LANDINGPAGE_REGISTER_BASEROUTE}`]);
    }
}
