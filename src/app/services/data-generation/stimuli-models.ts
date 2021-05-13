export interface RatingTaskStimuli {
    activity: string;
    type: "DoNothing" | "DoSomething";
    questions: {
        question: string;
        legend: string[]; // automatically low to high endorsement by default
    }[];
}
