import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SnackbarService } from "../../../services/snackbar.service";
import { TaskManagerService } from "../../../services/task-manager.service";
import { Subscription } from "rxjs";
import { UserService } from "src/app/services/user.service";
import { take } from "rxjs/operators";
import { wait } from "src/app/common/commonMethods";
import { LoaderService } from "src/app/services/loader/loader.service";
import { ClearanceService } from "src/app/services/clearance.service";
declare function setFullScreen(): any;

@Component({
    selector: "app-crowdsource-login",
    templateUrl: "./crowdsource-login.component.html",
    styleUrls: ["./crowdsource-login.component.scss"],
})
export class CrowdSourceLoginComponent implements OnInit, OnDestroy {
    workerId: string = "";
    studyId: number;
    urlContainsCode: boolean = false;
    subscriptions: Subscription[] = [];

    constructor(
        private _route: ActivatedRoute,
        private _snackbarService: SnackbarService,
        private _taskManager: TaskManagerService,
        private userService: UserService,
        private loaderService: LoaderService,
        private clearanceService: ClearanceService
    ) {}

    ngOnInit(): void {
        this._getQueryParams();
    }

    // If the url contains a study shortcode then we get it here.
    // Otherwise the user will be prompted to enter their own shortcode.
    private _getQueryParams() {
        this.subscriptions.push(
            this._route.queryParams.subscribe((params) => {
                const studyIdFromURL = params["studyid"] as string;
                if (studyIdFromURL) {
                    this.urlContainsCode = true;
                    this.studyId = parseInt(studyIdFromURL);
                }
            })
        );
    }

    async onRegister() {
        this.clearanceService.clearServices();

        this.loaderService.showLoader();
        await this.startGameInFullScreen();
        this.userService
            .registerCrowdsourcedUser(this.workerId, this.studyId)
            .pipe(take(1))
            .subscribe(
                (response) => {
                    this.userService.isCrowdsourcedUser = true;
                    this.userService.crowdsourcedUserStudyId = this.studyId;
                    this.userService.userAsync.subscribe(
                        (user) => {
                            if (user !== null) {
                                this._snackbarService.openSuccessSnackbar("Registered: " + this.workerId);
                                this._taskManager.configureStudy(this.studyId, 0);
                                this.loaderService.hideLoader();
                            }
                        },
                        (err) => {
                            this.loaderService.hideLoader();
                            throw new Error(err);
                        }
                    );
                    // trigger the above subscribe. Need to get user first because the study route is only
                    // entitled when the user cookie has been set in the header
                    this.userService.updateUser();
                },
                (err) => {
                    // if headers too large error
                    this.loaderService.hideLoader();
                    if (err.status && err.status === 431) {
                        this._snackbarService.openErrorSnackbar(
                            "There was an error. Please try clearing your cookies, or open the study in incognito mode.",
                            "",
                            6000
                        );
                    } else {
                        console.log(err);
                        this._snackbarService.openErrorSnackbar(err.message || err.error?.message);
                    }
                }
            );
    }

    async startGameInFullScreen() {
        setFullScreen();
        await wait(1000); // delay to allow screen to expand
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
