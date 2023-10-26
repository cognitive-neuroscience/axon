import { Component, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
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
    EQuestionType,
    IBaseQuestion,
    IBaseQuestionnaireComponent,
    IMultipleChoiceSelect,
    IRadioButtons,
    QuestionnaireMetadata,
    TActions,
    TConditional,
    TOption,
} from './models';
import {
    getConditionalMappingHelper,
    keysExistAndAreUniqueHelper,
    someElementInFirstListExistsInSecondList,
    valIsEmpty,
} from './utils';

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
            dependentControlsList: (Pick<TConditional, 'doConditional'> & { controlAffectedKey: string })[];
            originalValidators: ValidatorFn[];
            state: { options?: TOption[] };
            actions?: TActions;
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
                actions: question.actions || undefined,
                valueChangesSubscription: null,
            };

            // 4. Add to formGroup IF it initially should be visible
            const doConditional = question?.condition?.doConditional;
            // for controls that are shown conditionally, we can assume for now that the initial value of the parent is none.
            // therefore, we can assume that the control will initially be invisible
            const shouldInitiallyHide =
                doConditional?.onlyHideWhenEmpty === true ||
                !!doConditional?.onlyShowWhenValuesSelected ||
                !!doConditional?.populateResultsBasedOnSelectedValues;

            if (!shouldInitiallyHide) {
                this.questionnaire.addControl(question.key, new UntypedFormControl('', validatorFnArr));
            }
            if (
                (keyToDependentKeysMap[question.key] || question.actions) &&
                this.questionnaire.controls[question.key]
            ) {
                // if this control has dependencies, then we want to subscribe to value changes
                const subscription = this.questionnaire.controls[question.key]?.valueChanges.subscribe(() => {
                    this.handleActions(question.key);
                    this.handleDependents(question.key);
                });
                this.formControlsState[question.key].valueChangesSubscription = subscription;
                this.subscriptions.push(subscription);
            }
        });
    }

    private removeControlFromFormGroup(key: string) {
        if (this.formControlsState[key].valueChangesSubscription) {
            this.formControlsState[key].valueChangesSubscription?.unsubscribe();
            this.formControlsState[key].valueChangesSubscription = null;
        }
        this.questionnaire.removeControl(key);
        this.formControlsState[key].dependentControlsList.forEach(({ controlAffectedKey }) => {
            this.formControlsState[controlAffectedKey].valueChangesSubscription?.unsubscribe();
            this.formControlsState[controlAffectedKey].valueChangesSubscription = null;
            this.questionnaire.removeControl(controlAffectedKey);
        });
    }

    private addControlToFormGroup(key: string) {
        this.questionnaire.addControl(key, new UntypedFormControl('', this.formControlsState[key].originalValidators));
        if (this.formControlsState[key].dependentControlsList.length > 0 || this.formControlsState[key].actions) {
            const subscription = this.questionnaire.controls[key].valueChanges.subscribe(() => {
                this.handleActions(key);
                this.handleDependents(key);
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

    private handleActions(controlKey: string) {
        if (!this.formControlsState[controlKey]) return;
        if (!this.formControlsState[controlKey].actions) return;
        const action = this.formControlsState[controlKey].actions;
        const currentValues = this.questionnaire.controls[controlKey].value;
        if (!Array.isArray(currentValues)) return;

        if (action.clearOtherOptionsWhenValueSelected) {
            // given a bunch of selected values that we want to clear for, we can assume only one of the values in the clearOtherOptionsWhenValueSelected
            // array will exist at a time
            const clearOtherOptionsAsThisHasBeenSelected = currentValues.find((currentValue) =>
                action.clearOtherOptionsWhenValueSelected.includes(currentValue)
            );

            // We check that either the clearOtherOptionsWhenValueSelected is selected in the dropdown
            // and it is not the only one selected
            if (!!clearOtherOptionsAsThisHasBeenSelected && currentValues.length > 1) {
                this.questionnaire.controls[controlKey].setValue([clearOtherOptionsAsThisHasBeenSelected]);
            }
        }

        if (action.onlyDisableOtherOptionsWhenValueSelected) {
            // given a bunch of selected values that we want to clear for, we can assume only one of the values in the onlyDisableOtherOptionsWhenValueSelected
            // array will exist at a time
            const disableOtherOptionsAsThisHasBeenSelected = currentValues.find((currentValue) =>
                action.onlyDisableOtherOptionsWhenValueSelected.includes(currentValue)
            );
            const options = this.getMetadataOptions(controlKey);
            if (!!disableOtherOptionsAsThisHasBeenSelected) {
                this.formControlsState[controlKey] = {
                    ...this.formControlsState[controlKey],
                    state: {
                        ...this.formControlsState[controlKey].state,
                        options: options.map((option) => ({
                            ...option,
                            disabled: option.value !== disableOtherOptionsAsThisHasBeenSelected,
                        })),
                    },
                };
            } else {
                this.formControlsState[controlKey] = {
                    ...this.formControlsState[controlKey],
                    state: {
                        ...this.formControlsState[controlKey].state,
                        options: options,
                    },
                };
                return;
            }
        }
    }

    private handleOnlyShowWhenEmptyConditional(
        dependentControl: Pick<TConditional, 'doConditional'> & {
            controlAffectedKey: string;
        },
        controlBeingChangedNewValue: string | number | boolean | string[]
    ) {
        let shouldShow = valIsEmpty(controlBeingChangedNewValue);
        shouldShow
            ? this.addControlToFormGroup(dependentControl.controlAffectedKey)
            : this.removeControlFromFormGroup(dependentControl.controlAffectedKey);
    }

    private handleOnlyHideWhenEmptyConditional(
        dependentControl: Pick<TConditional, 'doConditional'> & {
            controlAffectedKey: string;
        },
        controlBeingChangedNewValue: string | number | boolean | string[]
    ) {
        let newValuesSelected = controlBeingChangedNewValue;
        if (
            Array.isArray(newValuesSelected) &&
            (dependentControl.doConditional?.populateResultsBasedOnSelectedValues?.valuesToHide?.length || 0) > 0
        ) {
            newValuesSelected = newValuesSelected.filter((valSelected) => {
                const selectedValueShouldBeKept =
                    dependentControl.doConditional.populateResultsBasedOnSelectedValues.valuesToHide.every(
                        (optionToHide) => optionToHide !== valSelected
                    );
                return selectedValueShouldBeKept;
            });
        }

        let shouldHide = valIsEmpty(newValuesSelected);
        shouldHide
            ? this.removeControlFromFormGroup(dependentControl.controlAffectedKey)
            : this.addControlToFormGroup(dependentControl.controlAffectedKey);
    }

    private handleOnlyShowWhenValuesSelectedConditional(
        dependentControl: Pick<TConditional, 'doConditional'> & {
            controlAffectedKey: string;
        },
        controlBeingChangedNewValue: string | number | boolean | string[]
    ) {
        const newValuesConvertedToArray = Array.isArray(controlBeingChangedNewValue)
            ? controlBeingChangedNewValue
            : [controlBeingChangedNewValue];

        const shouldSetToVisible = someElementInFirstListExistsInSecondList(
            newValuesConvertedToArray,
            dependentControl.doConditional.onlyShowWhenValuesSelected || []
        );
        shouldSetToVisible
            ? this.addControlToFormGroup(dependentControl.controlAffectedKey)
            : this.removeControlFromFormGroup(dependentControl.controlAffectedKey);
    }

    private hideWhenValuesSelectedConditional(
        dependentControl: Pick<TConditional, 'doConditional'> & {
            controlAffectedKey: string;
        },
        controlBeingChangedNewValue: string | number | boolean | string[]
    ) {
        const newValuesConvertedToArray = Array.isArray(controlBeingChangedNewValue)
            ? controlBeingChangedNewValue
            : [controlBeingChangedNewValue];

        const exists = someElementInFirstListExistsInSecondList(
            newValuesConvertedToArray,
            dependentControl.doConditional.hideWhenValuesSelected || []
        );
        if (exists) {
            this.removeControlFromFormGroup(dependentControl.controlAffectedKey);
        }
    }

    private handlePopulateResultsBasedOnSelectedValuesConditional(
        dependentControl: Pick<TConditional, 'doConditional'> & {
            controlAffectedKey: string;
        },
        controlBeingChangedNewValue: string | number | boolean | string[],
        controlBeingChangedKey: string
    ) {
        if (!Array.isArray(controlBeingChangedNewValue)) return;
        const options = this.getMetadataOptions(controlBeingChangedKey);
        let newSelectedValues = [...controlBeingChangedNewValue];

        if (
            dependentControl.doConditional.populateResultsBasedOnSelectedValues?.valuesToHide &&
            dependentControl.doConditional.populateResultsBasedOnSelectedValues.valuesToHide.length > 0
        ) {
            newSelectedValues = newSelectedValues.filter((newValue) => {
                const selectedValueShouldBeShown =
                    dependentControl.doConditional.populateResultsBasedOnSelectedValues.valuesToHide.every(
                        (optionToHide) => optionToHide !== newValue
                    );
                return selectedValueShouldBeShown;
            });
        }

        // we must make sure that the control object assigned here is a object (instead of modifying in place) for
        // angular change detection to work. This is similar to react
        this.formControlsState[dependentControl.controlAffectedKey] = {
            ...this.formControlsState[dependentControl.controlAffectedKey],
            state: {
                ...this.formControlsState[dependentControl.controlAffectedKey].state,
                options: newSelectedValues.map((val) => {
                    const mappedOption = options.find((x) => x.value === val);
                    return mappedOption ? mappedOption : { label: val, value: val };
                }),
            },
        };

        // this case happens when input B depends on input A and input A's selected values
        // have changed. Input B can then have a value that is invalid.
        // ex:  input A is an MultipleChoice question with options [1, 2, 3]
        //      input b is dependent on input A (i.e. input B's title: choose the BEST answer from A)
        //
        //      steps:
        //          User selects option 1 and option 2 for input A
        //          User then goes to input b and selection option 2
        //          User then removed option 2 from input A. Now input B has an invalid value
        // TODO: handle the edge case where the dependent input B allows multi select, in which case we
        // need to handle comparison of two arrays.
        if (
            this.questionnaire.contains(dependentControl.controlAffectedKey) &&
            !controlBeingChangedNewValue.includes(this.questionnaire.get(dependentControl.controlAffectedKey).value)
        ) {
            this.questionnaire.get(dependentControl.controlAffectedKey).setValue('');
        }
    }

    private handleDependents(controlBeingChangedKey: string) {
        if (!this.formControlsState[controlBeingChangedKey]) return;
        const controlBeingChangedNewValue: string | number | boolean | string[] =
            this.questionnaire.controls[controlBeingChangedKey].value;

        this.formControlsState[controlBeingChangedKey].dependentControlsList.forEach((dependentControl) => {
            const conditional = dependentControl.doConditional;

            if (conditional.onlyShowWhenEmpty) {
                this.handleOnlyShowWhenEmptyConditional(dependentControl, controlBeingChangedNewValue);
            } else if (conditional.onlyHideWhenEmpty) {
                this.handleOnlyHideWhenEmptyConditional(dependentControl, controlBeingChangedNewValue);
            } else if (conditional.onlyShowWhenValuesSelected) {
                this.handleOnlyShowWhenValuesSelectedConditional(dependentControl, controlBeingChangedNewValue);
            }

            if (conditional.hideWhenValuesSelected) {
                this.hideWhenValuesSelectedConditional(dependentControl, controlBeingChangedNewValue);
            }

            if (conditional.populateResultsBasedOnSelectedValues) {
                this.handlePopulateResultsBasedOnSelectedValuesConditional(
                    dependentControl,
                    controlBeingChangedNewValue,
                    controlBeingChangedKey
                );
            }
            // in the future:
            // if (conditional.otherConditional) { ... }
        });
    }

    onSubmit() {
        if (!this.wasClicked) {
            this.wasClicked = true;
            const questionaireResponse = {};
            const keysToExclude = this.metadata.componentConfig.questions
                .filter(
                    (question) =>
                        question.questionType === EQuestionType.divider ||
                        question.questionType === EQuestionType.displayText
                )
                .map((question) => question.key);

            Object.keys(this.questionnaire.controls).forEach((key) => {
                if (keysToExclude.includes(key)) return;

                const controlValue = this.questionnaire.controls[key].value;
                const valueIsArray = Array.isArray(controlValue);
                const valueIsObj = typeof controlValue === 'object';

                if (valueIsArray) {
                    // for multi select with allowMultiple=true
                    questionaireResponse[key] = controlValue.reduce(
                        (acc: string, currVal: string, currIndex: number) => {
                            return currIndex === 0 ? currVal : `${acc}, ${currVal}`;
                        },
                        ''
                    );
                } else if (valueIsObj) {
                    // for matrix type component
                    Object.keys(controlValue).forEach((matrixKey) => {
                        questionaireResponse[matrixKey] = controlValue[matrixKey];
                    });
                } else {
                    questionaireResponse[key] = controlValue;
                }
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
