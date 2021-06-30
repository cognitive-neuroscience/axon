import { StudyTask } from "./Task";

export class Study {
    id: number;
    createdAt: string;
    deletedAt: string;
    internalName: string;
    externalName: string;
    started: boolean;
    description: string;
    tasks: StudyTask[];
    canEdit: boolean;
}
