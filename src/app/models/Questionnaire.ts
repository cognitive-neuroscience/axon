export abstract class QuestionnaireResponse {
    userID: string;
    experimentCode: string;
}

export class DemographicsQuestionnaireResponse extends QuestionnaireResponse {
    age: number;
    sex: string;
    selfIdentification: string;
    yearsOfEducation: number;
    hasNeuroConditions: boolean;
    hasPsychConditions: boolean;
}

export class FeedbackQuestionnaireResponse extends QuestionnaireResponse {
    issuesEncountered: string;
    additionalFeedback: string;
}