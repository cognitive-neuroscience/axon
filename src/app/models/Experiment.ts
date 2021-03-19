import { Questionnaire } from './Questionnaire';
import { CustomTask } from './TaskData';

export class Experiment {
    name: string;
    code: string;
    description: string;
    tasks: string[];
    deleted: boolean;
    questionnaires: Questionnaire[];
    customTasks: CustomTask[];

    constructor(name: string, code: string, description: string, tasks: string[], deleted: boolean = false) {
        this.name = name;
        this.code = code;
        this.description = description;
        this.tasks = tasks;
        this.deleted = deleted
    }
}