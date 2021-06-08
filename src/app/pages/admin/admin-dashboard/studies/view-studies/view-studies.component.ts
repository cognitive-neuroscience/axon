import { Component, OnDestroy, OnInit } from "@angular/core";
import { Study } from "../../../../../models/Study";
import { StudyService } from "../../../../../services/study.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationService } from "../../../../../services/confirmation.service";
import { SnackbarService } from "../../../../../services/snackbar.service";
import { Observable, of, Subscription } from "rxjs";
import { environment } from "../../../../../../environments/environment";
import { UserService } from "src/app/services/user.service";
import { Router } from "@angular/router";
import { AdminRouteNames } from "src/app/models/enums";
import { mergeMap } from "rxjs/operators";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { CreateModifyStudyComponent } from "../create-modify-study/create-modify-study.component";

@Component({
    selector: "app-view-studies",
    templateUrl: "./view-studies.component.html",
    styleUrls: ["./view-studies.component.scss"],
})
export class ViewStudiesComponent implements OnInit, OnDestroy {
    LINK: string = environment.production
        ? "https://psharplab.campus.mcgill.ca/#/crowdsource-participant?code="
        : "http://localhost:4200/#/crowdsource-participant?code=";

    subscriptions: Subscription[] = [];

    constructor(
        private studyService: StudyService,
        private dialog: MatDialog,
        private confirmationService: ConfirmationService,
        private snackbarService: SnackbarService,
        private userService: UserService,
        private router: Router
    ) {}

    studies: Observable<Study[]>;

    get isAdmin(): Observable<boolean> {
        return this.userService.userIsAdmin;
    }

    ngOnInit(): void {
        this.studies = this.studyService.studies;
        if (!this.studyService.hasStudies) this.studyService.update();
    }

    navigateToCreateStudy() {
        this.router.navigate([
            `${AdminRouteNames.DASHBOARD_BASEROUTE}/${AdminRouteNames.STUDIES_SUBROUTE}/${AdminRouteNames.STUDIES_CREATE_SUBROUTE}`,
        ]);
    }

    handleEdit(study: Study) {
        this.dialog.open(CreateModifyStudyComponent, { width: "90%", height: "80%", data: study });
    }

    handleViewData(study: Study) {
        this.router.navigate([`${AdminRouteNames.DASHBOARD_BASEROUTE}/${AdminRouteNames.DATA_SUBROUTE}/${study.id}`]);
    }

    handleDelete(study: Study) {
        this.subscriptions.push(
            this.confirmationService
                .openConfirmationDialog(`Are you sure you want to delete this study?`)
                .pipe(
                    mergeMap((ok) => {
                        return ok ? this.studyService.deleteStudy(study.id) : of(false);
                    })
                )
                .subscribe((ok) => {
                    if (ok) {
                        this.studyService.update();
                        this.snackbarService.openSuccessSnackbar("Successfully deleted study");
                    }
                })
        );
    }

    showCopiedMessage() {
        this.snackbarService.openSuccessSnackbar("Copied to clipboard");
    }

    toggleStudyActiveStatus(study: Study, event: MatSlideToggleChange) {
        const active = event.checked;
        this.subscriptions.push(
            this.confirmationService
                .openConfirmationDialog(`Are you sure you want to ${active ? "activate" : "deactivate"} the study?`)
                .pipe(
                    mergeMap((ok) => {
                        study.started = active;
                        return ok ? this.studyService.editStudy(study) : of(false);
                    })
                )
                .subscribe((ok) => {
                    // either a boolean or httpresponse, so we can check truthiness
                    if (ok) {
                        this.snackbarService.openSuccessSnackbar("Successfully updated task");
                    } else {
                        study.started = false;
                    }
                })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
