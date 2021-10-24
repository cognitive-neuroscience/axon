import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Platform, RouteNames, TaskType } from 'src/app/models/enums';
import { Task } from 'src/app/models/Task';
import { EmbeddedPageNavigationConfig } from 'src/app/pages/tasks/embedded-page/embedded-page.component';
import { TaskService } from 'src/app/services/task.service';
import { ViewComponentsTableModel } from '../shared/view-components-table/view-components-table.component';

@Component({
    selector: 'app-pavlovia-tasks',
    templateUrl: './pavlovia-tasks.component.html',
    styleUrls: ['./pavlovia-tasks.component.scss'],
})
export class PavloviaTasksComponent {
    constructor(private taskService: TaskService, private router: Router) {}

    get NABPavloviaTasksForTable(): Observable<ViewComponentsTableModel<Task>> {
        return this.taskService.tasks.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter((task) => task.taskType === TaskType.NAB && task.fromPlatform === Platform.PAVLOVIA)
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
                    {
                        columnHeader: 'URL',
                        columnKey: 'externalURL',
                    },
                ],
                tableData: tasks,
                msgOnEmpty: 'No pavlovia NAB Tasks',
                tableTitle: 'Neuropsych Battery (NAB)',
            }))
        );
    }

    get experimentalPavloviaTasksForTable(): Observable<ViewComponentsTableModel<Task>> {
        return this.taskService.tasks.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter(
                          (task) => task.taskType === TaskType.EXPERIMENTAL && task.fromPlatform === Platform.PAVLOVIA
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
                    {
                        columnHeader: 'URL',
                        columnKey: 'externalURL',
                    },
                ],
                tableData: tasks,
                msgOnEmpty: 'No questionnaires',
                tableTitle: 'Experimental Tasks',
            }))
        );
    }

    run(task: Task) {
        const config: EmbeddedPageNavigationConfig = {
            config: {
                externalURL: task.externalURL,
                task: task,
            },
            mode: 'test',
        };
        this.router.navigate([`${RouteNames.PAVLOVIA}`], { state: config });
    }
}
