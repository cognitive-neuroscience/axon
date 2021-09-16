import { Component, OnInit } from "@angular/core";
import { SessionStorageService } from "src/app/services/sessionStorage.service";
import { UserService } from "src/app/services/user.service";

@Component({
    selector: "app-participant-dashboard",
    templateUrl: "./participant-dashboard.component.html",
    styleUrls: ["./participant-dashboard.component.scss"],
})
export class ParticipantDashboardComponent implements OnInit {
    studyId: number;

    constructor(
        private sessionStorageService: SessionStorageService,
        private userService: UserService,
    ) {}

    ngOnInit(): void {
        this.studyId = parseInt(this.sessionStorageService.getStudyIdFromSessionStorage());
        if (!this.userService.userHasValue) this.userService.updateUser();

        if (this.studyId && this.userService.userHasValue) {
            this.userService.registerParticipantForStudy(this.userService.user, this.studyId).subscribe(
                (_) => {
                    this.sessionStorageService.clearSessionStorage();
                    this.userService.updateStudyUsers();
                },
                (err) => {
                    // user has already registered for this study, but no need to show error
                    // as it confuses users who think there's an issue
                    this.sessionStorageService.clearSessionStorage();
                }
            );
        }
    }
}
