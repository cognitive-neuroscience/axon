import { SharplabTaskConfig } from '../pages/tasks/task-playables/task-player/task-player.component';
import { Task } from './Task';

export interface StudyTask {
    studyId: number;
    task: Task;
    taskOrder: number;
    config: {} | SharplabTaskConfig; // json task metadata or questionnaire metadata
}
