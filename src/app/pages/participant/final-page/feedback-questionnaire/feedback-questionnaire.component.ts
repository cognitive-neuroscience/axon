import { Component, OnInit } from "@angular/core";
import { FeedbackQuestionnaireResponse } from "../../../../models/Questionnaire";
import { TaskManagerService } from "../../../../services/task-manager.service";
import { FormBuilder, Validators } from "@angular/forms";
import { MatSelectChange } from "@angular/material/select";
import { UserService } from "src/app/services/user.service";
import { ParticipantDataService } from "src/app/services/study-data.service";
import { SnackbarService } from "src/app/services/snackbar.service";
import { TimerService } from "src/app/services/timer.service";
import { ParticipantType } from "src/app/models/enums";

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

    get isValid(): boolean {
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
        private taskManager: TaskManagerService,
        private fb: FormBuilder,
        private userService: UserService,
        private participantDataService: ParticipantDataService,
        private snackbarService: SnackbarService,
        private timerService: TimerService
    ) {}

    ngOnInit(): void {}

    submitForm() {
        if (this.feedbackQuestionnaire.valid && this.isValid) {
            this.saveResponse();
        }
    }

    saveResponse() {
        const userID = this.userService.user.id.toString();
        const studyID = this.taskManager.study.id;

        const obj: FeedbackQuestionnaireResponse = {
            userId: userID,
            studyId: studyID,
            issuesEncountered: this.feedbackQuestionnaire.get("issuesEncountered").value,
            additionalFeedback: this.feedbackQuestionnaire.get("additionalFeedback").value,
            browser: this.showOtherField ? this.otherField : this.feedbackQuestionnaire.get("browser").value,
            submittedAt: this.timerService.getCurrentTimestamp(),
            participantType: this.userService.isCrowdsourcedUser
                ? ParticipantType.CROWDSOURCED
                : ParticipantType.ACCOUNTHOLDER,
        };

        this.participantDataService.uploadFeedback(obj).subscribe(
            (done) => {
                this.formSubmitted = true;
                this.snackbarService.openSuccessSnackbar("thank you for submitting your feedback");
            },
            (err) => {
                this.snackbarService.openErrorSnackbar(err.message);
            }
        );
    }
}
