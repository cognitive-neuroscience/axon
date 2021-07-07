import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Platform, RouteNames, TaskType } from "src/app/models/enums";
import { Task } from "src/app/models/Task";
import { CustomTask } from "src/app/models/TaskData";
import { EmbeddedPageNavigationConfig } from "src/app/pages/tasks/embedded-page/embedded-page.component";
import { TaskService } from "src/app/services/task.service";

@Component({
    selector: "app-pavlovia-tasks",
    templateUrl: "./pavlovia-tasks.component.html",
    styleUrls: ["./pavlovia-tasks.component.scss"],
})
export class PavloviaTasksComponent implements OnInit {
    displayedTaskColumns = ["name", "description", "url", "actions"];

    customTasks: Observable<CustomTask[]>;

    ngOnInit() {
        this.pavloviaTasks = this.taskService.tasks;
    }

    pavloviaTasks: Observable<Task[]>;

    get experimentalPavloviaTasks(): Observable<Task[]> {
        return this.pavloviaTasks.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter(
                          (task) => task.taskType === TaskType.EXPERIMENTAL && task.fromPlatform === Platform.PAVLOVIA
                      )
                    : []
            )
        );
    }

    get NABPavloviaTasks(): Observable<Task[]> {
        return this.pavloviaTasks.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter((task) => task.taskType === TaskType.NAB && task.fromPlatform === Platform.PAVLOVIA)
                    : []
            )
        );
    }

    run(task: Task) {
        const config: EmbeddedPageNavigationConfig = {
            config: {
                externalURL: task.externalURL,
                task: task,
            },
            mode: "test",
        };
        this.router.navigate([`${RouteNames.PAVLOVIA}`], { state: config });
    }

    constructor(private taskService: TaskService, private router: Router) {}
}
