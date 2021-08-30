import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TaskService } from "../../../../../services/task.service";
import { Task } from "../../../../../models/Task";
import { Observable, Subscription } from "rxjs";
import { Platform, RouteNames, TaskType } from "../../../../../models/enums";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { TaskPlayerNavigationConfig } from "src/app/pages/tasks/task-playables/task-player/task-player.component";

@Component({
    selector: "app-view-tasks",
    templateUrl: "./view-tasks.component.html",
    styleUrls: ["./view-tasks.component.scss"],
})
export class ViewTasksComponent implements OnInit, OnDestroy {
    // contains Ids of completed tasks
    completedTasks: number[] = [];

    subscribers: Subscription[] = [];

    displayedColumnsForStudies = ["name", "description", "route"];

    tasklist: Observable<Task[]>;

    constructor(private router: Router, private taskService: TaskService, private http: HttpClient) {}

    ngOnInit() {
        this.tasklist = this.taskService.tasks;
    }

    run(task: Task) {
        const navigationConfig: TaskPlayerNavigationConfig = {
            metadata: task.config,
            mode: "test",
        };

        this.router.navigate([`${RouteNames.TASKPLAYER}`], { state: navigationConfig });
    }

    get NABTask(): Observable<Task[]> {
        return this.tasklist.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter((task) => task.taskType === TaskType.NAB && task.fromPlatform === Platform.PSHARPLAB)
                    : []
            )
        );
    }

    get experimentalTasks(): Observable<Task[]> {
        return this.tasklist.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter(
                          (task) => task.taskType === TaskType.EXPERIMENTAL && task.fromPlatform === Platform.PSHARPLAB
                      )
                    : []
            )
        );
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
