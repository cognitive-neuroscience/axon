import { SharplabTaskConfig } from '../pages/tasks/task-playables/task-player/task-player.component';
import { NullTime } from './InternalDTOs';
import { StudyTask } from './StudyTask';
import { Task } from './Task';
import { User } from './User';
import { Platform } from './enums';

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
    snapshots: {
        [key: string]: (Task & { taskOrder: number })[];
    };
}
