import { TaskType } from "./InternalDTOs";

export class Task {
    id: string;
    title: string;
    description: string;
    type: TaskType;
    route: string;
}