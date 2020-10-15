export abstract class TaskData {
    trial: number;
    userID: string;
    score: number;
}

export class StroopTask extends TaskData {
    actualAnswer:   string;
    userAnswer:     string;
    isCongruent:    boolean;
    responseTime:   number;
    isCorrect:      boolean;
    set:            number;
}

export class NBack extends TaskData {
    actualAnswer: string;
    userAnswer: string;
    responseTime: number;
    isCorrect: boolean;
    set: number;
}