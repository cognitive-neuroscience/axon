export interface TaskData {
    trial: number;
    userID: string;
}

export class StroopTask implements TaskData {
    trial:          number;
    userID:         string;
    actualAnswer:   string;
    userAnswer:     string;
    isCongruent:    boolean;
    responseTime:   number;
    isCorrect:      boolean;
    score:          number;
    set:            number;
}