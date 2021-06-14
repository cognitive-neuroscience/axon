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
