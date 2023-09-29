import { ITranslationText } from 'src/app/models/InternalDTOs';
import { ComponentName } from 'src/app/services/component-factory.service';

export interface QuestionnaireMetadata {
    componentName: ComponentName;
    componentConfig: {
        title: string;
        questions: IBaseQuestionnaireComponent[];
    };
}

type TQuestionStyles = {
    'title-font-size': 'sm' | 'md' | 'lg' | 'xl';
    'text-content-font-size': 'sm' | 'md' | 'lg' | 'xl';
};

export type TValidation = {
    required?: boolean;
    isNumeric?: boolean;
    max?: number;
    min?: number;
    maxLength?: number;
    minLength?: number;
};

export type TConditional = {
    dependsOnKey: string; // this is the key of the question that this is conditional on
    doAction: {
        onlyShowWhenEmpty?: boolean; // show when empty and hide otherwise
        onlyHideWhenEmpty?: boolean; // hide when empty and show otherwise
        onlyShowWhenValuesSelected?: string[]; // show when values are selected and hide otherwise
        hideWhenValuesSelected?: string[]; // hide when given values are selected. If given values are not selected, ignore.
        populateResultsBasedOnSelectedValues?: boolean; // populated dependent multi select or matrix with the selected parent values
    };
};

export type TActions = {
    onlyDisableOtherOptionsWhenValueSelected?: string[]; // only for allowMultipleSelections = true. Disable other options when value is selected. Enable otherwise
    clearOtherOptionsWhenValueSelected?: string[]; // only for allowMultipleSelections = true. Clear other options when value is selected. Do nothing otherwise
};

export type TOption = {
    label: string | ITranslationText;
    value: string | number | boolean;
    disabled?: boolean;
};

export enum EQuestionType {
    multipleChoiceSelect = 'multipleChoiceSelect',
    radiobuttons = 'radiobuttons',
    freeTextResponse = 'freeTextResponse',
    input = 'input',
    slider = 'slider',
    displayText = 'displayText',
    divider = 'divider',
    matrix = 'matrix',
}

export interface IBaseQuestionnaireComponent {
    questionType: EQuestionType;
    key: string; // unique property of the input - this is what will be used when getting the data. Mandatory for all questionTypes
    condition?: TConditional;
    actions?: TActions;
}

export interface IBaseQuestion extends IBaseQuestionnaireComponent {
    title?: string | ITranslationText;
    textContent?: string | ITranslationText;
    validation?: TValidation;
}

export interface IMultipleChoiceSelect extends IBaseQuestion {
    indent?: number; // amount of indentation for the given text
    allowMultipleSelections?: boolean;
    options?: TOption[];
    label?: string | ITranslationText;
    styles?: TQuestionStyles;
}

export interface IRadioButtons extends IBaseQuestion {
    radiobuttonPresentation?: 'horizontal' | 'vertical';
    radioButtonImageOptions?: string[]; // a list of image paths to present in the questionnaire for radiobuttons
    styles?: TQuestionStyles;
    label?: string | ITranslationText;
    options?: TOption[];
}

export interface IMatrix extends IBaseQuestion {
    options?: TOption[];
    styles?: TQuestionStyles;
    legend: {
        value: string | number | boolean;
        label: string | ITranslationText;
    }[];
    legendTitle?: string;
}

export interface IFreeTextResponse extends IBaseQuestion {
    label?: string | ITranslationText;
}

export interface IInput extends IBaseQuestion {
    label?: string | ITranslationText;
}

export interface ISlider extends IBaseQuestion {
    styles?: TQuestionStyles;
    legend?: (string | ITranslationText)[]; // legend for slider, slider values are spaced out automatically
}

// not a question, purely decorative
export interface IDisplayText extends IBaseQuestionnaireComponent {
    indent?: number; // amount of indentation for the given text
    styles?: TQuestionStyles;
    title?: string | ITranslationText;
    textContent?: string | ITranslationText;
}

// not a question, purely decorative
export interface IDivider extends IBaseQuestionnaireComponent {}
