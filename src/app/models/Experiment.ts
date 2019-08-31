export class Experiment {
    id?: number = 0;
    title: string = '';
    description: string = '';
    route: string = '';
    type: string = '';
    isScored: boolean = true;
    showFeedbackAfterEveryTrial: boolean = true;
    showScoreAfterEveryTrial: boolean = true;
    numberOfBreaks: number = 0;
    maxResponseTime: number = 800;
    durationOfFeedback: number = 1000;
    interTrialDelay: number = 1000;
    practiceTrials: number = 1;
    actualTrials: number = 10;
}
