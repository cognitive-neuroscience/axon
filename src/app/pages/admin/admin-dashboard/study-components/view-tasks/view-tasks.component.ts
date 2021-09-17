import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../../../services/task.service';
import { Task } from '../../../../../models/Task';
import { Observable, Subscription } from 'rxjs';
import { Platform, RouteNames, TaskType } from '../../../../../models/enums';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { TaskPlayerNavigationConfig } from 'src/app/pages/tasks/task-playables/task-player/task-player.component';
import { ViewComponentsTableModel } from '../shared/view-components-table/view-components-table.component';

@Component({
    selector: 'app-view-tasks',
    templateUrl: './view-tasks.component.html',
    styleUrls: ['./view-tasks.component.scss'],
})
export class ViewTasksComponent implements OnInit, OnDestroy {
    subscribers: Subscription[] = [];

    tasklist: Observable<Task[]>;

    constructor(private router: Router, private taskService: TaskService) {}

    ngOnInit() {
        this.tasklist = this.taskService.tasks;
    }

    get NABTasksForTable(): Observable<ViewComponentsTableModel<Task>> {
        return this.tasklist.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter((task) => task.taskType === TaskType.NAB && task.fromPlatform === Platform.PSHARPLAB)
                    : []
            ),
            map((tasks) => ({
                tableConfig: [
                    {
                        columnHeader: 'Name',
                        columnKey: 'name',
                    },
                    {
                        columnHeader: 'Description',
                        columnKey: 'description',
                    },
                ],
                tableData: tasks,
                msgOnEmpty: 'No NAB Tasks',
                tableTitle: 'Neuropsych Battery (NAB)',
            }))
        );
    }

    run(task: Task) {
        const navigationConfig: TaskPlayerNavigationConfig = {
            metadata: task.config,
            mode: 'test',
        };

        this.router.navigate([`${RouteNames.TASKPLAYER}`], { state: navigationConfig });
    }

    get experimentalTasksForTable(): Observable<ViewComponentsTableModel<Task>> {
        return this.tasklist.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter(
                          (task) => task.taskType === TaskType.EXPERIMENTAL && task.fromPlatform === Platform.PSHARPLAB
                      )
                    : []
            ),
            map((tasks) => ({
                tableConfig: [
                    {
                        columnHeader: 'Name',
                        columnKey: 'name',
                    },
                    {
                        columnHeader: 'Description',
                        columnKey: 'description',
                    },
                ],
                tableData: tasks,
                msgOnEmpty: 'No NAB Tasks',
                tableTitle: 'Experimental Tasks',
            }))
        );
    }

    ngOnDestroy() {
        this.subscribers.forEach((x) => x.unsubscribe());
    }
}
