import { ParticipantType } from "./enums";

export class FeedbackQuestionnaireResponse {
    userId: string;
    studyId: number;
    issuesEncountered: string;
    additionalFeedback: string;
    browser: string;
    submittedAt: string;
    participantType: ParticipantType;
}
