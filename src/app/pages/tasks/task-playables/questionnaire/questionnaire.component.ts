import { Component, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NzMarks } from 'ng-zorro-antd/slider';
import { Subject, Subscription } from 'rxjs';
import { getTextForLang } from 'src/app/common/commonMethods';
import { ITranslationText } from 'src/app/models/InternalDTOs';
import { SupportedLangs } from 'src/app/models/enums';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { Navigation } from '../../shared/navigation-buttons/navigation-buttons.component';
import { IOnComplete, Playable } from '../playable';
import { TaskPlayerState } from '../task-player/task-player.component';
import {
    IBaseQuestion,
    IBaseQuestionnaireComponent,
    IMultipleChoiceSelect,
    IRadioButtons,
    QuestionnaireMetadata,
    TConditional,
    TOption,
} from './models';
import { getConditionalMappingHelper, keysExistAndAreUniqueHelper } from './utils';

@Component({
    selector: 'app-questionnaire',
    templateUrl: './questionnaire.component.html',
    styleUrls: ['./questionnaire.component.scss'],
})
export class QuestionnaireComponent implements Playable, OnDestroy {
    subscriptions: Subscription[] = [];
    metadata: QuestionnaireMetadata;
    questionnaire: UntypedFormGroup;
    wasClicked = false;
    isVisible = false;
    taskData: any[];

    formControlsState: {
        [key: string]: {
            dependentControlsList: (Pick<TConditional, 'doAction'> & { controlAffectedKey: string })[];
            originalValidators: ValidatorFn[];
            state: { options: TOption[] };
            valueChangesSubscription: Subscription | null;
        };
    } = {};

    constructor(
        protected loaderService: LoaderService,
        private translateService: TranslateService,
        private taskManager: TaskManagerService
    ) {}

    controlIsVisible(key: string): boolean {
        return this.questionnaire.contains(key);
    }

    onComplete: Subject<IOnComplete> = new Subject<{ navigation: Navigation; taskData: any[] }>();

    handleComplete(nav: Navigation, data?: any[]): void {
        this.onComplete.next({ navigation: nav, taskData: data });
    }

    afterInit(): void {}

    configure(metadata: QuestionnaireMetadata, config?: TaskPlayerState) {
        this.metadata = metadata;
        if (!keysExistAndAreUniqueHelper(this.metadata)) {
            this.taskManager.handleErr('Questionnaire Error. Please contact sharplab.neuro@mcgill.ca');
        } else {
            this.taskData = [];
            this.setupForm(this.metadata);
            this.isVisible = true;
        }
    }

    get questions(): IBaseQuestionnaireComponent[] {
        return this.metadata?.componentConfig?.questions || [];
    }

    get title(): string {
        return this.handleText(this.metadata?.componentConfig?.title);
    }

    handleText(text: string | ITranslationText): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, text);
    }

    setupForm(metadata: QuestionnaireMetadata) {
        this.formControlsState = {};
        this.questionnaire = new UntypedFormGroup({});

        // 1. Create initial Mapping between key and dependent keys
        const keyToDependentKeysMap = getConditionalMappingHelper(metadata);

        metadata.componentConfig.questions.forEach((question) => {
            // 2. Calculate initial validators based on the question.validators object
            let validatorFnArr: ValidatorFn[] = [];
            if (question['validation']) {
                const questionValidation = (question as IBaseQuestion).validation;
                if (questionValidation.required) validatorFnArr.push(Validators.required);
                if (questionValidation.max !== undefined) validatorFnArr.push(Validators.max(questionValidation.max));
                if (questionValidation.min !== undefined) validatorFnArr.push(Validators.min(questionValidation.min));
                if (questionValidation.minLength !== undefined)
                    validatorFnArr.push(Validators.minLength(questionValidation.minLength));
                if (questionValidation.maxLength !== undefined)
                    validatorFnArr.push(Validators.minLength(questionValidation.maxLength));
            }

            // 3. Add to formControlsState. All controls are added to this object
            this.formControlsState[question.key] = {
                dependentControlsList: keyToDependentKeysMap[question.key] || [],
                originalValidators: validatorFnArr,
                state: {
                    options: [],
                },
                valueChangesSubscription: null,
            };

            // 4. Add to formGroup IF it initially should be visible
            if (question?.condition?.doAction?.showOnValuesSelected || question?.condition?.doAction?.showOnNonEmpty) {
                // noop
                // for controls that are shown conditionally, we can assume for now that the initial value of the parent is none.
                // therefore, we can assume that the control will initially be invisible
            } else {
                this.questionnaire.addControl(question.key, new UntypedFormControl('', validatorFnArr));
            }
            if (keyToDependentKeysMap[question.key]) {
                // if this control has dependencies, then we want to subscribe to value changes
                const subscription = this.questionnaire.controls[question.key].valueChanges.subscribe((val) => {
                    this.handleDependents(question.key, val);
                });
                this.formControlsState[question.key].valueChangesSubscription = subscription;
                this.subscriptions.push(subscription);
            }
        });
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

    private removeControlFromFormGroup(key: string) {
        if (this.formControlsState[key].valueChangesSubscription) {
            this.formControlsState[key].valueChangesSubscription.unsubscribe();
            this.formControlsState[key].valueChangesSubscription = null;
        }
        this.questionnaire.removeControl(key);
    }

    private addControlToFormGroup(key: string) {
        this.questionnaire.addControl(key, new UntypedFormControl('', this.formControlsState[key].originalValidators));
        if (this.formControlsState[key].dependentControlsList.length > 0) {
            const subscription = this.questionnaire.controls[key].valueChanges.subscribe((val) => {
                this.handleDependents(key, val);
            });
            this.formControlsState[key].valueChangesSubscription = subscription;
            this.subscriptions.push(subscription);
        }
    }

    private getMetadataOptions(key: string): TOption[] {
        const question = this.metadata.componentConfig.questions.find((x) => x.key === key);
        if (!question) return [];

        return (question as IMultipleChoiceSelect | IRadioButtons)?.options || [];
    }

    private handleDependents(
        controlBeingChangedKey: string,
        controlBeingChangedNewValue: string | number | boolean | string[]
    ) {
        if (!this.formControlsState[controlBeingChangedKey]) return;

        this.formControlsState[controlBeingChangedKey].dependentControlsList.forEach((dependentControl) => {
            const action = dependentControl.doAction;
            if (action.showOnValuesSelected) {
                const shouldSetToVisible = (action.showOnValuesSelected || []).some(
                    (val) => val === controlBeingChangedNewValue
                );
                shouldSetToVisible
                    ? this.addControlToFormGroup(dependentControl.controlAffectedKey)
                    : this.removeControlFromFormGroup(dependentControl.controlAffectedKey);
            }
            if (action.showOnNonEmpty) {
                const newValIsArray = Array.isArray(controlBeingChangedNewValue);
                const arrIsNotEmpty = newValIsArray ? controlBeingChangedNewValue.length > 0 : true;

                const shouldSetToVisible =
                    controlBeingChangedNewValue !== undefined &&
                    controlBeingChangedNewValue !== null &&
                    controlBeingChangedNewValue !== '' &&
                    arrIsNotEmpty;

                shouldSetToVisible
                    ? this.addControlToFormGroup(dependentControl.controlAffectedKey)
                    : this.removeControlFromFormGroup(dependentControl.controlAffectedKey);
            }
            if (action.populateResultsBasedOnSelectedValues) {
                if (!Array.isArray(controlBeingChangedNewValue)) return;
                const options = this.getMetadataOptions(controlBeingChangedKey);
                this.formControlsState[dependentControl.controlAffectedKey].state.options =
                    controlBeingChangedNewValue.map((val) => {
                        const mappedOption = options.find((x) => x.value === val);
                        return mappedOption ? mappedOption : { label: val, value: val };
                    });

                // this case happens when input B depends on input A and input As multiple selected
                // have changed. Input A can then have a value that is invalid.
                // TODO: handle the edge case where the dependent input B allows multi select, in whch case we
                // need to handle comparison of two arrays.
                if (
                    this.questionnaire.contains(dependentControl.controlAffectedKey) &&
                    !controlBeingChangedNewValue.includes(
                        this.questionnaire.get(dependentControl.controlAffectedKey).value
                    )
                ) {
                    this.questionnaire.get(dependentControl.controlAffectedKey).setValue('');
                }
            }
            // in the future:
            // if (conditionAction.otherAction) { ... }
        });
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
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.onComplete.complete();
    }
}
