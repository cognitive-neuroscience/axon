import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, RouteNames, TaskType } from 'src/app/models/enums';
import { Task } from 'src/app/models/Task';
import { TaskPlayerNavigationConfig } from 'src/app/pages/tasks/task-playables/task-player/task-player.component';
import { TaskService } from 'src/app/services/task.service';
import { ViewComponentsTableModel } from '../shared/view-components-table/view-components-table.component';

@Component({
    selector: 'app-pavlovia-tasks',
    templateUrl: './pavlovia-tasks.component.html',
    styleUrls: ['./pavlovia-tasks.component.scss'],
})
export class PavloviaTasksComponent {
    constructor(private taskService: TaskService, private router: Router) {}

    get NABPavloviaTasksForTable(): ViewComponentsTableModel<Task> {
        const pavloviaTasks = this.taskService.tasksValue.filter(
            (task) => task.taskType === TaskType.NAB && task.fromPlatform === Platform.PAVLOVIA
        );

        return {
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
            tableData: pavloviaTasks,
            msgOnEmpty: 'No pavlovia NAB Tasks',
            tableTitle: 'Neuropsych Battery (NAB)',
        };
    }

    get experimentalPavloviaTasksForTable(): ViewComponentsTableModel<Task> {
        const pavloviaTasks = this.taskService.tasksValue.filter(
            (task) => task.taskType === TaskType.EXPERIMENTAL && task.fromPlatform === Platform.PAVLOVIA
        );

        return {
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
            tableData: pavloviaTasks,
            msgOnEmpty: 'No questionnaires',
            tableTitle: 'Experimental Tasks',
        };
    }

    run(task: Task) {
        const config: TaskPlayerNavigationConfig = {
            mode: 'test',
            metadata: task.config,
        };
        this.router.navigate([`${RouteNames.TASKPLAYER}`], { state: config });
    }
}
