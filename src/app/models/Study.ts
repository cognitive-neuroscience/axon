import { NullTime } from './InternalDTOs';
import { StudyTask } from './StudyTask';
import { Task } from './Task';
import { User } from './User';

export class Study {
    id: number;
    createdAt: string;
    deletedAt: NullTime;
    internalName: string;
    externalName: string;
    started: boolean;
    canEdit: boolean;
    consent: Task;
    owner: Partial<User>;
    description: string;
    config: any; // json metadata
    studyTasks: StudyTask[];
}
