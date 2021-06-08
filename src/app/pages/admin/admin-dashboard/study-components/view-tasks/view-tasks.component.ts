import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TaskService } from "../../../../../services/task.service";
import { Task } from "../../../../../models/Task";
import { Subscription } from "rxjs";
import { TaskType } from "../../../../../models/enums";

@Component({
    selector: "app-view-tasks",
    templateUrl: "./view-tasks.component.html",
    styleUrls: ["./view-tasks.component.scss"],
})
export class ViewTasksComponent implements OnInit, OnDestroy {
    // contains Ids of completed tasks
    completedTasks: string[] = [];

    subscribers: Subscription[] = [];

    displayedColumnsForStudies = ["title", "description", "route"];

    tasklist: Task[] = [];

    constructor(private router: Router, private tasklistService: TaskService) {}

    ngOnInit() {
        this.tasklistService.update();
        // this.getTasklist();
    }

    // private getTasklist(): void {
    //     this.subscribers.push(
    //         this.tasklistService.taskList.subscribe((tasks) => {
    //             this.tasklist = tasks;
    //         })
    //     );
    // }

    run(task: Task) {
        // const taskRoute = RouteMap[task.id].route;
        // if (taskRoute) {
        //     this.router.navigate([taskRoute]);
        // }
    }

    get NABTask() {
        return [];
        // return this.tasklist ? this.tasklist.filter((t) => t.type === TaskType.NAB) : [];
    }

    get experimentalTasks() {
        return [];
        // return this.tasklist ? this.tasklist.filter((t) => t.type === TaskType.Experimental) : [];
    }

    // returns true if the given task is complete, and false otherwise
    taskIsComplete(task: Task): boolean {
        if (!this.completedTasks || !task || !task.id) return false;
        return this.completedTasks.includes(task.id) ? true : false;
    }

    ngOnDestroy() {
        this.subscribers.forEach((x) => x.unsubscribe());
    }
}
