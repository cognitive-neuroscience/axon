import { Color, ITranslationText } from 'src/app/models/InternalDTOs';

export interface RatingTaskStimuli {
    activity: ITranslationText;
    type: 'DoNothing' | 'DoSomething';
    questions: {
        question: ITranslationText;
        legend: ITranslationText[]; // automatically low to high endorsement by default
    }[];
}

export interface ChoiceTaskStimulus {
    firstActivity: ITranslationText;
    secondActivity: ITranslationText;
    set: 'first' | 'second';
}

export interface OddballStimulus {
    stimulus: string;
    blob: Blob;
    isTarget: boolean;
}

export class ImageBlob {
    [imgName: string]: Blob;
}

export class StroopStimulus {
    color: string;
    congruent: boolean;
    word: string;
}

export class SmileyFaceStimulus {
    faceShown: SmileyFaceType;
}

export enum SmileyFaceType {
    SHORT = 'SHORT',
    LONG = 'LONG',
    NONE = 'NONE',
}

export class NBackStimulus {
    trial: number;
    currentLetter: string;
    nback: string;
}

export class NBackStimuliSet {
    1: NBackStimulus[];
    2: NBackStimulus[];
    3: NBackStimulus[];
    4: NBackStimulus[];
}

export enum DemandSelectionCounterbalance {
    SELECTEASYPATCH = 'EASIER PATCH',
    SELECTHARDPATCH = 'HARDER PATCH',
    NONE = 'NONE',
}

export class DemandSelectionStimulus {
    firstPatchImgName: string;
    secondPatchImgName: string;
    rotation: number;
    counterbalance: DemandSelectionCounterbalance;
    firstPatch: Color;
    secondPatch: Color;
    digit: number;
}

export class TaskSwitchingStimulus {
    color: Color;
    digit: number;
}

export class DigitSpanStimuliSet {
    practice: {
        forwardSequence: DigitSpanStimulus[];
        backwardSequence: DigitSpanStimulus[];
    };
    actual: {
        forwardSequence: DigitSpanStimulus[];
        backwardSequence: DigitSpanStimulus[];
    };
}

export class DigitSpanStimulus {
    first: number[];
    second: number[];
}

export class TrailMakingStimuliSet {
    numeric: {
        practice: TrailMakingStimulus;
        actual: TrailMakingStimulus;
    };
    alphanumeric: {
        practice: TrailMakingStimulus;
        actual: TrailMakingStimulus;
    };
}

export class TrailMakingStimulus {
    correctSequence: (string | number)[];
    grid: { value: string | number }[][];
}

export enum TrailMakingTrialType {
    ALPHANUMERIC = 'ALPHANUMERIC',
    NUMERIC = 'NUMERIC',
}

export class SARTStimulus {
    digit: number;
    fontSize: number;
    trialType: SARTTrialType;
}

export enum SARTTrialType {
    GO = 'GO',
    NOGO = 'NOGO',
}

export enum SARTStimuliSetType {
    ASCENDING = 'ascending',
    RANDOM = 'random',
}

export class FaceNameAssociationStimulus {
    personName: string;
    correctPersonName: string;
    imageName: string;
    isFemale: boolean;
    trialType: FaceNameAssociationTaskTrialtype;
}

export enum FaceNameAssociationTaskTrialtype {
    RECOMBINED = 'RECOMBINED',
    INTACT = 'INTACT',
}

export enum PLTStimulusType {
    STIM20 = 'stim20',
    STIM30 = 'stim30',
    STIM40 = 'stim40',
    STIM60 = 'stim60',
    STIM70 = 'stim70',
    STIM80 = 'stim80',
    PRACTICESTIM80 = 'practiceStim80',
    PRACTICESTIM20 = 'practiceStim20',
}

export class PLTStimulus {
    leftStimulusName: PLTStimulusType;
    rightStimulusName: PLTStimulusType;
    leftStimulusRewarded: boolean;
    rightStimulusRewarded: boolean;
    expectedSelectedStimulus: PLTStimulusType;
}
