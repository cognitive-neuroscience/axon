import { Component, OnInit } from "@angular/core";
import { QuestionnaireService } from "../../../../services/questionnaire.service";
import { FeedbackQuestionnaireResponse } from "../../../../models/Questionnaire";
import { AuthService } from "../../../../services/auth.service";
import { TaskManagerService } from "../../../../services/task-manager.service";
import { take } from "rxjs/operators";
import { SnackbarService } from "../../../../services/snackbar.service";
import { FormBuilder, Validators } from "@angular/forms";
import { MatSelectChange } from "@angular/material/select";

@Component({
    selector: "app-feedback-questionnaire",
    templateUrl: "./feedback-questionnaire.component.html",
    styleUrls: ["./feedback-questionnaire.component.scss"],
})
export class FeedbackQuestionnaireComponent implements OnInit {
    readonly browserList: string[] = [
        "Google Chrome",
        "Mozilla Firefox",
        "Microsoft Edge",
        "Internet Explorer",
        "Safari",
        "Opera",
        "Other",
    ];

    showOtherField: boolean = false;
    otherField: string = "";

    feedbackQuestionnaire = this.fb.group({
        issuesEncountered: ["", [Validators.maxLength(250)]],
        additionalFeedback: ["", [Validators.maxLength(250)]],
        browser: ["", [Validators.maxLength(250)]],
    });

    isValid(): boolean {
        const issuesEncountered: string = this.feedbackQuestionnaire.get("issuesEncountered").value;
        const additionalFeedback: string = this.feedbackQuestionnaire.get("additionalFeedback").value;
        const browser: string = this.feedbackQuestionnaire.get("browser").value;

        return issuesEncountered.length > 0 || additionalFeedback.length > 0 || this.isValidBrowserInput(browser);
    }

    isValidBrowserInput(browser: string): boolean {
        if (this.showOtherField) {
            return this.otherField.length > 0 && this.otherField.length < 250;
        } else {
            return browser.length > 0;
        }
    }

    formSubmitted: boolean = false;

    onSelectChange(event: MatSelectChange) {
        if (event.value === "Other") {
            this.showOtherField = true;
        } else {
            this.showOtherField = false;
        }
    }

    constructor(
        private questionnaireService: QuestionnaireService,
        private authService: AuthService,
        private taskManager: TaskManagerService,
        private snackbarService: SnackbarService,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {}

    submitForm() {
        if (this.feedbackQuestionnaire.valid && this.isValid()) {
            this.saveResponse();
        }
    }

    saveResponse() {
        const userID = this.authService.getDecodedToken().UserID;
        const studyCode = this.taskManager.getStudyCode();

        const obj: FeedbackQuestionnaireResponse = {
            userID: userID,
            studyCode: studyCode,
            issuesEncountered: this.feedbackQuestionnaire.get("issuesEncountered").value,
            additionalFeedback: this.feedbackQuestionnaire.get("additionalFeedback").value,
            browser: this.showOtherField ? this.otherField : this.feedbackQuestionnaire.get("browser").value,
        };

        this.questionnaireService
            .saveFeedQuestionnaireResponse(obj)
            .pipe(take(1))
            .subscribe((ok) => {
                if (ok) {
                    this.formSubmitted = true;
                } else {
                    this.snackbarService.openErrorSnackbar("There was an error submitting feedback");
                }
            });
    }
}
