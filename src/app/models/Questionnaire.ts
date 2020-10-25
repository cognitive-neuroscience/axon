export abstract class QuestionnaireResponse {
    userID: string;
    experimentCode: string;
}

export class MturkQuestionnaireResponse extends QuestionnaireResponse {
    age: number;
    sex: string;
    selfIdentification: string;
    yearsOfEducation: number;
    hasNeuroConditions: boolean;
    hasPsychConditions: boolean;
}