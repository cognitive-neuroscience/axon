import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NzMarks } from 'ng-zorro-antd/slider';
import { getTextForLang } from 'src/app/common/commonMethods';
import { SupportedLangs } from 'src/app/models/enums';
import { ComponentName } from 'src/app/services/component-factory.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { TaskPlayerState } from '../task-player/task-player.component';
import { Playable, IOnComplete } from '../playable';
import { Subject } from 'rxjs';
import { Navigation } from '../../shared/navigation-buttons/navigation-buttons.component';
import { ITranslationText } from 'src/app/models/InternalDTOs';

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
    label?: string | ITranslationText; // label of the input
    title?: string | ITranslationText; // title of the input - shown above the input itself
    textContent?: string | ITranslationText; // explanatory text below the title
    legend?: (string | ITranslationText)[]; // legend for slider, slider values are spaced out automatically
    validation?: {
        required?: boolean;
        isNumeric?: boolean;
        max?: number;
        min?: number;
        maxLength?: number;
        minLength?: number;
    };
    multipleChoiceOptions?: {
        label: string | ITranslationText;
        value: any;
    }[];
}

interface QuestionnaireMetadata {
    componentName: ComponentName;
    componentConfig: {
        title: string;
        questions: Question[];
    };
}

@Component({
    selector: 'app-questionnaire',
    templateUrl: './questionnaire.component.html',
    styleUrls: ['./questionnaire.component.scss'],
})
export class QuestionnaireComponent implements Playable, OnDestroy {
    metadata: QuestionnaireMetadata;
    questionnaire: FormGroup;
    wasClicked = false;
    isVisible = false;
    taskData: any[];

    constructor(
        protected loaderService: LoaderService,
        private translateService: TranslateService,
        private taskManager: TaskManagerService
    ) {}

    onComplete: Subject<IOnComplete> = new Subject<{ navigation: Navigation; taskData: any[] }>();

    handleComplete(nav: Navigation, data?: any[]): void {
        this.onComplete.next({ navigation: nav, taskData: data });
    }

    afterInit(): void {}

    configure(metadata: QuestionnaireMetadata, config?: TaskPlayerState) {
        this.metadata = metadata;
        if (!this.keysExistAndAreUnique(this.metadata)) {
            this.taskManager.handleErr();
        } else {
            this.questionnaire = this.getFormGroup(this.metadata);
            this.taskData = [];
            this.isVisible = true;
        }
    }

    get questions(): Question[] {
        return this.metadata?.componentConfig?.questions || [];
    }

    get title(): string {
        return this.handleText(this.metadata?.componentConfig?.title);
    }

    handleText(text: string | ITranslationText): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, text);
    }

    getFormGroup(metadata: QuestionnaireMetadata): FormGroup {
        const formGroup: {
            [key: string]: FormControl;
        } = {};
        metadata.componentConfig.questions.forEach((question) => {
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

        metadata.componentConfig.questions.forEach((question) => {
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

    getSliderMarks(legend: (string | ITranslationText)[]): NzMarks {
        const tempMarks: NzMarks = {};
        if (!legend || legend.length == 0) {
            return {};
        }
        let index = 0;
        const tickIncrement = 100 / (legend.length - 1);

        for (let i = 0; i < legend.length; i++) {
            tempMarks[index] = this.handleText(legend[i]);
            index += tickIncrement;
        }

        return tempMarks;
    }

    onSubmit() {
        if (!this.wasClicked) {
            this.wasClicked = true;
            const questionaireResponse = {};
            Object.keys(this.questionnaire.controls).forEach((key) => {
                const value = this.questionnaire.controls[key].value;
                const isArray = Array.isArray(this.questionnaire.controls[key].value);
                // for multi select, reduce array to a string with all selected options
                const reducer = (acc: string, currVal: string, currIndex: number) =>
                    currIndex === 0 ? currVal : `${acc}, ${currVal}`;

                questionaireResponse[key] = isArray ? (value as string[]).reduce(reducer, '') : value;
            });

            // override typecheck for questionnaire response
            this.taskData.push({
                ...(questionaireResponse as any),
            });

            this.handleComplete(Navigation.NEXT, this.taskData);
        }
    }

    ngOnDestroy(): void {
        this.onComplete.complete();
    }
}
