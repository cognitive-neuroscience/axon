import { Platform, TaskType } from "./enums";

export class Task {
    id: string;
    fromPlatform: Platform;
    taskType: TaskType;
    name: string;
    description: string;
    externalURL?: string;
    config?: any; // will either store task metadata or questionnaire metadata
}

export class StudyTask {
    studyId: string;
    taskId: string;
    taskOrder: number;
    config: any; // json task metadata or questionnaire metadata
    task: Task;
}
