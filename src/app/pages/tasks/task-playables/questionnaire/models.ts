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
        showOnNonEmpty?: string[];
        showOnValuesSelected?: string[];
        populateResultsBasedOnSelectedValues?: boolean;
    };
};

export type TOption = {
    label: string | ITranslationText;
    value: string | number | boolean;
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
    condition?: TConditional;
    key: string; // unique property of the input - this is what will be used when getting the data. Mandatory for all questionTypes
}

export interface IBaseQuestion extends IBaseQuestionnaireComponent {
    title?: string | ITranslationText;
    textContent?: string | ITranslationText;
    validation?: TValidation;
}

export interface IMultipleChoiceSelect extends IBaseQuestion {
    allowMultipleSelections?: boolean;
    options?: TOption[];
    label?: string | ITranslationText;
}

export interface IRadioButtons extends IBaseQuestion {
    radioButtonPresentation?: 'horizontal' | 'vertical';
    radioButtonImageOptions?: string[]; // a list of image paths to present in the questionnaire for radiobuttons
    styles?: TQuestionStyles;
    label?: string | ITranslationText;
    options?: TOption[];
}

export interface IMatrix extends IBaseQuestion {
    options?: TOption[];
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
