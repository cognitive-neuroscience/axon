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
    currentEmploymentStatus: string;
    householdIncome: string;
    socialClass: string;
}

export class FeedbackQuestionnaireResponse extends QuestionnaireResponse {
    issuesEncountered: string;
    additionalFeedback: string;
    browser: string;
}

export class Questionnaire {
    questionnaireID: string;
    url: string;
    name: string;
    description: string;
}
