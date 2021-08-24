import { Role } from "./enums";
import { Study } from "./Study";

export class User {
    id: number;
    email: string;
    password?: string;
    role: Role;
    createdAt: string;
    changePasswordRequired: boolean;
}

export class CrowdsourcedUser {
    participantId: string;
    studyId: number;
    registerDate: string;
    completionCode: string;
}

export class NullTime {
    valid: boolean;
    time: string;
}

export class StudyUser {
    userId: number;
    studyId: number;
    completionCode: string;
    registerDate: string;
    dueDate: NullTime;
    currentTaskIndex: number;
    hasAcceptedConsent: boolean;
    study?: Study;
}
