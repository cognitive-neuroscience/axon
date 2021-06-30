import { Component } from "@angular/core";
import { FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ParticipantDataService } from "src/app/services/participant-data.service";
import { TaskManagerService } from "src/app/services/task-manager.service";
import { UserService } from "src/app/services/user.service";

class Question {
    questionType: "multipleChoiceSelect" | "radiobuttons" | "freeTextResponse" | "displayText" | "divider" | "input";
    radiobuttonPresentation?: "horizontal" | "vertical";
    key: string; // unique property of the input - this is what will be used when getting the data. Mandatory for all questionTypes except divider and free text
    label?: string; // label of the input
    title?: string; // title of the input - shown above the input itself
    textContent?: string; // explanatory text below the title
    validation?: {
        required?: boolean;
        isNumeric?: boolean;
        max?: number;
        min?: number;
        maxLength?: number;
        minLength?: number;
    };
    multipleChoiceOptions?: {
        label: string;
        value: any;
    }[];
}

class QuestionnaireMetadata {
    title: string;
    questions: Question[];
}

export class QuestionnaireNavigationConfig {
    metadata: QuestionnaireMetadata;
    mode: "test" | "actual";
}

@Component({
    selector: "app-questionnaire-reader",
    templateUrl: "./questionnaire-reader.component.html",
    styleUrls: ["./questionnaire-reader.component.scss"],
})
export class QuestionnaireReaderComponent {
    questionnaireMetadata: QuestionnaireNavigationConfig;
    questionnaire: FormGroup;

    get isValid(): boolean {
        return this.questionnaireMetadata?.metadata?.questions?.length > 0;
    }

    get title(): string {
        return this.isValid ? this.questionnaireMetadata.metadata.title : "";
    }

    get questions(): Question[] {
        return this.isValid ? this.questionnaireMetadata.metadata.questions : [];
    }

    constructor(
        private taskManager: TaskManagerService,
        private participantDataService: ParticipantDataService,
        private userService: UserService,
        private router: Router
    ) {
        const state = this.router.getCurrentNavigation().extras.state as QuestionnaireNavigationConfig;

        if (state) {
            this.questionnaireMetadata = state;

            if (!this.keysExistAndAreUnique(this.questionnaireMetadata.metadata)) {
                this.taskManager.handleErr();
            } else {
                this.questionnaire = this.getFormGroup(this.questionnaireMetadata.metadata);
            }
        } else {
            this.taskManager.handleErr();
        }
    }

    getFormGroup(metadata: QuestionnaireMetadata): FormGroup {
        const formGroup: {
            [key: string]: FormControl;
        } = {};
        metadata.questions.forEach((question) => {
            if (question.questionType !== "divider" && question.questionType !== "displayText") {
                // extensible for later if we want to add other validators
                let validatorFnArr: ValidatorFn[] = [];
                if (question.validation) {
                    if (question.validation.required) validatorFnArr.push(Validators.required);
                    if (question.validation.max !== undefined)
                        validatorFnArr.push(Validators.max(question.validation.max));
                    if (question.validation.min !== undefined)
                        validatorFnArr.push(Validators.min(question.validation.min));
                    if (question.validation.minLength !== undefined)
                        validatorFnArr.push(Validators.minLength(question.validation.minLength));
                    if (question.validation.maxLength !== undefined)
                        validatorFnArr.push(Validators.minLength(question.validation.maxLength));
                }

                formGroup[question.key] =
                    validatorFnArr.length > 0 ? new FormControl("", validatorFnArr) : new FormControl("");
            }
        });

        return new FormGroup(formGroup);
    }

    private keysExistAndAreUnique(metadata: QuestionnaireMetadata): boolean {
        const keysMap: { [key: string]: boolean } = {};

        metadata.questions.forEach((question) => {
            if (question.questionType !== "freeTextResponse" && question.questionType !== "divider") {
                if (question.key === "" || question.key === undefined) return false;

                if (keysMap[question.key]) {
                    return false;
                } else {
                    keysMap[question.key] = true;
                }
            }
        });
        return true;
    }

    onSubmit() {
        const questionaireResponse = {};
        Object.keys(this.questionnaire.controls).forEach((key) => {
            questionaireResponse[key] = this.questionnaire.controls[key].value;
        });

        this.participantDataService
            .uploadTaskData(
                this.userService.isCrowdsourcedUser
                    ? this.userService.user?.email
                    : this.userService.user?.id.toString(),
                this.taskManager.currentStudyTask.studyId,
                this.taskManager.currentStudyTask.taskOrder,
                [questionaireResponse]
            )
            .subscribe(
                (ok) => {
                    this.taskManager.next();
                },
                (err) => {
                    this.taskManager.handleErr();
                }
            );
    }
}
