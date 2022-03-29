import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteNames, TaskType } from 'src/app/models/enums';
import { Task } from 'src/app/models/Task';
import { ReaderNavigationConfig } from 'src/app/pages/tasks/shared/base-reader';
import { TaskPlayerNavigationConfig } from 'src/app/pages/tasks/task-playables/task-player/task-player.component';
import { TaskService } from 'src/app/services/task.service';
import { ViewComponentsTableModel } from '../shared/view-components-table/view-components-table.component';

@Component({
    selector: 'app-view-info-displays',
    templateUrl: './view-info-displays.component.html',
    styleUrls: ['./view-info-displays.component.scss'],
})
export class ViewInfoDisplaysComponent {
    constructor(private taskService: TaskService, private router: Router) {}

    get infoDisplaysForTable(): Observable<ViewComponentsTableModel<Task>> {
        return this.taskService.tasks.pipe(
            map((tasks) => (tasks ? tasks.filter((task) => task.taskType === TaskType.INFO_DISPLAY) : [])),
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
                msgOnEmpty: 'No info display',
                tableTitle: '',
            }))
        );
    }

    showInfoDisplay(infoDisplay: Task) {
        const navigationConfig: TaskPlayerNavigationConfig = {
            metadata: infoDisplay.config,
            mode: 'test',
        };

        this.router.navigate([`${RouteNames.TASKPLAYER}`], { state: navigationConfig });
    }
}
