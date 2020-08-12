import { Task } from './Task';

export class Experiment {
    name: string;
    code: string;
    description: string;
    tasks: Task[];

    constructor(name: string, code: string, description: string, tasks: Task[]) {
        this.name = name;
        this.code = code;
        this.description = description;
        this.tasks = tasks;
    }
}