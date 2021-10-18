import { NullTime } from './Login';
import { StudyTask } from './Task';

export class Study {
    id: number;
    createdAt: string;
    deletedAt: NullTime;
    internalName: string;
    externalName: string;
    started: boolean;
    description: string;
    canEdit: boolean;
    consent: number;
    config: any; // json metadata
    tasks: StudyTask[];
}
