import { Component } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMarks } from 'ng-zorro-antd/slider';
import { of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { ParticipantDataService } from 'src/app/services/study-data.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { UserService } from 'src/app/services/user.service';
import { AbstractBaseReaderComponent } from '../shared/base-reader';

class Question {
    questionType:
        | 'multipleChoiceSelect'
        | 'radiobuttons'
        | 'freeTextResponse'
        | 'displayText'
        | 'divider'
        | 'input'
        | 'slider';
    radiobuttonPresentation?: 'horizontal' | 'vertical' = 'horizontal';
    allowMultipleSelections?: boolean; // for multiple choice select, allow multiple choices
    key: string; // unique property of the input - this is what will be used when getting the data. Mandatory for all questionTypes except divider and free text
    label?: string; // label of the input
    title?: string; // title of the input - shown above the input itself
    textContent?: string; // explanatory text below the title
    legend?: string[]; // legend for slider, slider values are spaced out automatically
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
    mode: 'test' | 'actual';
}

@Component({
    selector: 'app-questionnaire-reader',
    templateUrl: './questionnaire-reader.component.html',
    styleUrls: ['./questionnaire-reader.component.scss'],
})
export class QuestionnaireReaderComponent implements AbstractBaseReaderComponent {
    readerMetadata: QuestionnaireNavigationConfig;
    questionnaire: FormGroup;

    get isValid(): boolean {
        return this.readerMetadata?.metadata?.questions?.length > 0;
    }

    get title(): string {
        return this.isValid ? this.readerMetadata.metadata.title : '';
    }

    get questions(): Question[] {
        return this.isValid ? this.readerMetadata.metadata.questions : [];
    }

    constructor(
        private taskManager: TaskManagerService,
        private participantDataService: ParticipantDataService,
        private userService: UserService,
        private router: Router
    ) {
        const state = this.router.getCurrentNavigation().extras.state as QuestionnaireNavigationConfig;

        if (state) {
            this.readerMetadata = state;

            if (!this.keysExistAndAreUnique(this.readerMetadata.metadata)) {
                this.taskManager.handleErr();
            } else {
                this.questionnaire = this.getFormGroup(this.readerMetadata.metadata);
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
            if (question.questionType !== 'divider' && question.questionType !== 'displayText') {
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
                    validatorFnArr.length > 0 ? new FormControl('', validatorFnArr) : new FormControl('');
            }
        });

        return new FormGroup(formGroup);
    }

    private keysExistAndAreUnique(metadata: QuestionnaireMetadata): boolean {
        const keysMap: { [key: string]: boolean } = {};

        metadata.questions.forEach((question) => {
            if (question.questionType !== 'freeTextResponse' && question.questionType !== 'divider') {
                if (question.key === '' || question.key === undefined) return false;

                if (keysMap[question.key]) {
                    return false;
                } else {
                    keysMap[question.key] = true;
                }
            }
        });
        return true;
    }

    handleSliderValueSelected(key: string, value: number) {
        this.questionnaire.controls[key].setValue(value);
    }

    getSliderMarks(legend: string[]): NzMarks {
        const tempMarks: NzMarks = {};
        if (!legend || legend.length == 0) {
            return {};
        }
        let index = 0;
        const tickIncrement = 100 / (legend.length - 1);

        for (let i = 0; i < legend.length; i++) {
            tempMarks[index] = legend[i];
            index += tickIncrement;
        }

        return tempMarks;
    }

    onSubmit() {
        const questionaireResponse = {};
        Object.keys(this.questionnaire.controls).forEach((key) => {
            const value = this.questionnaire.controls[key].value;
            const isArray = Array.isArray(this.questionnaire.controls[key].value);
            const reducer = (acc: string, currVal: string, currIndex: number) =>
                currIndex === 0 ? currVal : `${acc}, ${currVal}`;

            questionaireResponse[key] = isArray ? (value as string[]).reduce(reducer, '') : value;
        });

        this.participantDataService
            .uploadTaskData(
                this.userService.isCrowdsourcedUser
                    ? this.userService.user?.email
                    : this.userService.user?.id.toString(),
                this.taskManager.currentStudyTask.studyId,
                this.taskManager.currentStudyTask.taskOrder,
                this.userService.isCrowdsourcedUser,
                [questionaireResponse]
            )
            .pipe(
                mergeMap((res) => {
                    if (res.ok) {
                        return this.userService.isCrowdsourcedUser ? of(true) : this.taskManager.setTaskAsComplete();
                    }
                    return of(false);
                }),
                take(1)
            )
            .subscribe(
                (res) => {
                    if (res) {
                        this.taskManager.next();
                    } else {
                        this.taskManager.handleErr();
                    }
                },
                (err) => {
                    this.taskManager.handleErr();
                }
            );
    }
}
