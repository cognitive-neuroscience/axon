import { SupportedLangs } from './enums';
import { NullTime } from './InternalDTOs';

export class StudyUser {
    userId: number;
    studyId: number;
    completionCode: string;
    registerDate: string;
    dueDate: NullTime;
    currentTaskIndex: number;
    hasAcceptedConsent: boolean;
    lang: SupportedLangs;
    data?: Record<string, any>;
}

export class StudyUserSummary {
    userId: number;
    studies: number[];
}
