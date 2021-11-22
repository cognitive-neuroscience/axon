import { Color } from 'src/app/models/InternalDTOs';

export interface RatingTaskStimuli {
    activity: string;
    type: 'DoNothing' | 'DoSomething';
    questions: {
        question: string;
        legend: string[]; // automatically low to high endorsement by default
    }[];
}

export interface ChoiceTaskStimulus {
    firstActivity: string;
    secondActivity: string;
    legend: string[];
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
    practice: NBackStimulus[];
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
