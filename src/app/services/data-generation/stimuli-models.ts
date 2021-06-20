export interface RatingTaskStimuli {
    activity: string;
    type: "DoNothing" | "DoSomething";
    questions: {
        question: string;
        legend: string[]; // automatically low to high endorsement by default
    }[];
}

export interface ChoiceTaskStimuli {
    firstActivity: string;
    secondActivity: string;
    legend: string[];
}

export interface OddballStimuli {
    stimulus: string;
    blob: Blob;
    isTarget: boolean;
}

export class ImageBlob {
    [imgName: string]: Blob;
}

export class StroopStimuli {
    trial: number;
    color: string;
    congruent: boolean;
    word: string;
}

export class StroopStimuliSet {
    practice: StroopStimuli[];
    1: StroopStimuli[];
    2: StroopStimuli[];
    3: StroopStimuli[];
    4: StroopStimuli[];
}
