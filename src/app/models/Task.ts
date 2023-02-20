import { SharplabTaskConfig } from '../pages/tasks/task-playables/task-player/task-player.component';
import { Platform, TaskType } from './enums';

export class Task {
    id: number;
    fromPlatform: Platform;
    taskType: TaskType;
    name: string;
    description: string;
    externalURL?: string;
    config: SharplabTaskConfig;
}
