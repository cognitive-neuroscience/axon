import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class TaskManagerService {
    
    private _initialTask: number = 0;
    private _tasks$: BehaviorSubject<string[]> = new BehaviorSubject([]);

    // 1. call startExperiment, which gets experiment from backend DB and extracts tasks
    // 2. keep track of task number and route user to task
    // 3. when finished, the task will call taskFinished and we increment the task number
    // 4. repeat until we are out of tasks. Display completion code

    startExperiment() {
        this._getTasks()
    }

    private _getTasks() {
        // this.
    }

    // called when the current task is complete
    taskFinished() {
    }
}