import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../../../services/task.service';
import { Task } from '../../../../../models/Task';
import { Observable, Subscription } from 'rxjs';
import { Platform, RouteNames, TaskType } from '../../../../../models/enums';
import { map } from 'rxjs/operators';
import { TaskPlayerNavigationConfig } from 'src/app/pages/tasks/task-playables/task-player/task-player.component';
import { ViewComponentsTableModel } from '../shared/view-components-table/view-components-table.component';

@Component({
    selector: 'app-view-tasks',
    templateUrl: './view-tasks.component.html',
    styleUrls: ['./view-tasks.component.scss'],
})
export class ViewTasksComponent implements OnDestroy {
    subscriptions: Subscription[] = [];

    constructor(private router: Router, private taskService: TaskService) {}

    get NABTasksForTable(): Observable<ViewComponentsTableModel<Task>> {
        return this.taskService.tasks.pipe(
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
        return this.taskService.tasks.pipe(
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
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
