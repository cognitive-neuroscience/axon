import { Role, SupportedLangs } from './enums';
import { Organization } from './Organization';

export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: Role;
    createdAt: string;
    changePasswordRequired: boolean;
    lang: SupportedLangs;
    organization: Organization | null;
}

export interface CrowdsourcedUser {
    participantId: string;
    studyId: number;
    registerDate: string;
    completionCode: string;
    lang: SupportedLangs;
}
