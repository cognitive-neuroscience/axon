import { SupportedLangs } from './enums';
import { NullTime } from './InternalDTOs';

export interface StudyUser {
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

export interface StudyUserSummary {
    userId: number;
    email: string;
    studies: number[];
}
