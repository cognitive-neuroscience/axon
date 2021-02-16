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
    browser: string;
}

export class ApathyQuestionnaireResponse extends QuestionnaireResponse {
   Q1: string;
   Q2: string;
   Q3: string; 
   Q4: string;
   Q5: string;
}

export class Questionnaire {
    questionnaireID: string;
    url: string;
    name: string;
    description: string;
}