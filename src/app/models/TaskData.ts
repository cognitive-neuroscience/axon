export abstract class TaskData {
    trial: number;
    userID: string;
    score: number;
}

export interface Stimuli {
    set: any[]
}

export class StroopTask extends TaskData {
    actualAnswer:   string;
    userAnswer:     string;
    isCongruent:    boolean;
    responseTime:   number;
    isCorrect:      boolean;
    set:            number;
}

export class StroopTaskStimuli implements Stimuli {
    set: {
        trial: number;
        color: string;
        congruent: number;
        word: string;
    }[]
}

export class NBack extends TaskData {
    actualAnswer: string;
    userAnswer: string;
    responseTime: number;
    isCorrect: boolean;
    set: number;
}

export class NBackStimuli implements Stimuli {
    set: {
        trial: number;
        currentLetter: string;
        nback: string;
    }[]
}

export class TaskSwitching extends TaskData {
    color: string;
    digit: number;
    actualAnswer: string;
    userAnswer: string;
    responseTime: number;
    isCorrect: boolean;
}

export class DemandSelection extends TaskData {
    patchImgSelected: string;
    patchImgNotSelected: string;
    color: string;
    digit: number;
    actualAnswer: string;
    userAnswer: string;
    counterbalance: string;
    responseTime: number;
    isCorrect: boolean;
    block: number;
}
