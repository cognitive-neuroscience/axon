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
    displayedPersonName: string;
    actualPersonName: string;
    trialType: FaceNameAssociationTaskTrialtype;
    imageName: string;
    gender: 'M' | 'F';
    imagePath: string;
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

export class IowaGamblingTaskStimulus {
    moneyWon: number;
    feePaid: number;
}

export class InformationTaskStimuliSet {
    optimalScore: number;
    cardValues: InformationTaskStimulus[];
}

export class InformationTaskStimulus {
    cardValue: number;
    expectedToExploit: boolean;
}

export class SDMTTaskSimulus {
    imageURL: string;
    expectedNumber: string;
    userAnswer: string;
}

export enum SDMTImageEnum {
    IMAGE1 = '/assets/images/stimuli/sdmt/1.png',
    IMAGE2 = '/assets/images/stimuli/sdmt/2.png',
    IMAGE3 = '/assets/images/stimuli/sdmt/3.png',
    IMAGE4 = '/assets/images/stimuli/sdmt/4.png',
    IMAGE5 = '/assets/images/stimuli/sdmt/5.png',
    IMAGE6 = '/assets/images/stimuli/sdmt/6.png',
    IMAGE7 = '/assets/images/stimuli/sdmt/7.png',
    IMAGE8 = '/assets/images/stimuli/sdmt/8.png',
    IMAGE9 = '/assets/images/stimuli/sdmt/9.png',
}

export interface SDMTImageToNumberMapping {
    [SDMTImageEnum.IMAGE1]: string;
    [SDMTImageEnum.IMAGE2]: string;
    [SDMTImageEnum.IMAGE3]: string;
    [SDMTImageEnum.IMAGE4]: string;
    [SDMTImageEnum.IMAGE5]: string;
    [SDMTImageEnum.IMAGE6]: string;
    [SDMTImageEnum.IMAGE7]: string;
    [SDMTImageEnum.IMAGE8]: string;
    [SDMTImageEnum.IMAGE9]: string;
}
