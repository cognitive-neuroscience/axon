import { Platform, TaskType } from "./enums";

export class Task {
    id: number;
    fromPlatform: Platform;
    taskType: TaskType;
    name: string;
    description: string;
    externalURL?: string;
    config?: any; // will either store task metadata or questionnaire metadata
}

export class StudyTask {
    studyId: number;
    taskId: number;
    taskOrder: number;
    config: any; // json task metadata or questionnaire metadata
    task: Task;
}
