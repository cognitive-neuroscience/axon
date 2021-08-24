import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ParticipantRouteNames, RouteNames } from "src/app/models/enums";

@Component({
    selector: "app-landing-page",
    templateUrl: "./landing-page.component.html",
    styleUrls: ["./landing-page.component.scss"],
})
export class LandingPageComponent implements OnInit {
    constructor(private router: Router) {}

    ngOnInit(): void {}

    navigateToCrowdSourceRegister() {
        this.router.navigate([ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE]);
    }

    navigateToForgotPassword() {
        this.router.navigate([RouteNames.LANDINGPAGE_FORGOT_PASSWORD]);
    }
}
