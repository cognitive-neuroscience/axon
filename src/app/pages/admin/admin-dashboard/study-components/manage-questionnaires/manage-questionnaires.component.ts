import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Observable, of, Subscription } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { ConsentIds } from "src/app/common/commonMethods";
import { Questionnaire } from "src/app/models/Questionnaire";
import { ConfirmationService } from "src/app/services/confirmation/confirmation.service";
import { QuestionnaireService } from "src/app/services/questionnaire.service";
import { SnackbarService } from "src/app/services/snackbar.service";
import { CreateQuestionnaireDialogComponent } from "./create-questionnaire-dialog/create-questionnaire-dialog.component";
import { HelpQuestionnaireDialogComponent } from "./help-questionnaire-dialog/help-questionnaire-dialog.component";
import { PreviewQuestionnaireDialogComponent } from "./preview-questionnaire-dialog/preview-questionnaire-dialog.component";

@Component({
    selector: "app-manage-questionnaires",
    templateUrl: "./manage-questionnaires.component.html",
    styleUrls: ["./manage-questionnaires.component.scss"],
})
export class ManageQuestionnairesComponent implements OnInit {
    constructor(
        private questionnaireService: QuestionnaireService,
        private dialog: MatDialog,
        private snackbarService: SnackbarService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {}

    questionnaires: Observable<Questionnaire[]>;
    subscriptions: Subscription[] = [];
    displayedQuestionnaireColumns = ["name", "description", "url", "actions"];
    hiddenQuestionnaires = [
        ...ConsentIds,
        // RouteMap.consent.id,
        // RouteMap.demographicsquestionnaire.id
    ];

    ngOnInit(): void {
        // this.questionnaires = this.questionnaireService.questionnaires.pipe(
        //     map((questionnaireList) =>
        //         questionnaireList
        //             ? questionnaireList.filter(
        //                   (questionnaire) => !this.hiddenQuestionnaires.includes(questionnaire.questionnaireID)
        //               )
        //             : []
        //     )
        // );
        // this.questionnaireService.update();
    }

    openCreateQuestionnaireModal() {
        const dialogRef = this.dialog.open(CreateQuestionnaireDialogComponent, { width: "30%" });
        this.subscriptions.push(
            dialogRef.afterClosed().subscribe((data: Questionnaire) => {
                if (data) this._createQuestionnaire(data);
            })
        );
    }

    private _createQuestionnaire(questionnaire: Questionnaire) {
        this.questionnaireService.createQuestionnaire(questionnaire).subscribe(
            (data) => {
                this.questionnaireService.update();
                this.snackbarService.openSuccessSnackbar("Successfully created new questionnaire");
            },
            (err: HttpErrorResponse) => {
                let errMsg = err.error?.message;
                if (!errMsg) {
                    errMsg = "Could not create questionnaire";
                }
                this.snackbarService.openErrorSnackbar(err.error?.message);
            }
        );
    }

    deleteQuestionnaire(questionnaire: Questionnaire) {
        this.confirmationService
            .openConfirmationDialog("Are you sure you want to delete the questionnaire: " + questionnaire.name + "?")
            .pipe(
                mergeMap((ok) => {
                    if (ok) {
                        return this.questionnaireService.deleteQuestionnaireByID(questionnaire.questionnaireID);
                    } else {
                        return of(false);
                    }
                })
            )
            .subscribe(
                (data) => {
                    if (data) {
                        this.questionnaireService.update();
                        this.snackbarService.openSuccessSnackbar("Successfully deleted " + questionnaire.name);
                    }
                },
                (err) => {
                    console.error(err);
                    this.snackbarService.openErrorSnackbar("There was an error deleting the user");
                }
            );
    }

    openQuestionnaireHelpModal() {
        this.dialog.open(HelpQuestionnaireDialogComponent, { width: "70%" });
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    previewQuestionnaire(questionnaire: Questionnaire) {
        this.dialog.open(PreviewQuestionnaireDialogComponent, {
            width: "80%",
            height: "90%",
            data: questionnaire,
        });
    }
}
