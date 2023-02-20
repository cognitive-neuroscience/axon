import { SupportedLangs } from './enums';
import { NullTime } from './InternalDTOs';
import { Study } from './Study';
import { User } from './User';

export class StudyUser {
    user: Partial<User>;
    study: Partial<Study>;
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
