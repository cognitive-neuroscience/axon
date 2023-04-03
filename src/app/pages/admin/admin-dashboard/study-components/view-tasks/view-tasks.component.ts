import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../../../services/task.service';
import { Task } from '../../../../../models/Task';
import { Subscription } from 'rxjs';
import { Platform, RouteNames, TaskType } from '../../../../../models/enums';
import {
    SharplabTaskConfig,
    TaskPlayerNavigationConfig,
} from 'src/app/pages/tasks/task-playables/task-player/task-player.component';
import { ViewComponentsTableModel } from '../shared/view-components-table/view-components-table.component';
import { MatDialog } from '@angular/material/dialog';
import { AlterMetadataDialogComponent } from './alter-metadata-dialog/alter-metadata-dialog.component';

@Component({
    selector: 'app-view-tasks',
    templateUrl: './view-tasks.component.html',
    styleUrls: ['./view-tasks.component.scss'],
})
export class ViewTasksComponent implements OnDestroy {
    subscriptions: Subscription[] = [];

    constructor(private router: Router, private taskService: TaskService, private dialog: MatDialog) {}

    get NABTasksForTable(): ViewComponentsTableModel<Task> {
        const NABTasks = this.taskService.tasksValue.filter(
            (task) => task.taskType === TaskType.NAB && task.fromPlatform === Platform.PSHARPLAB
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
            ],
            tableData: NABTasks,
            msgOnEmpty: 'No NAB Tasks',
            tableTitle: 'Neuropsych Battery (NAB)',
        };
    }

    run(task: Task) {
        const dialogRef = this.dialog.open(AlterMetadataDialogComponent, {
            width: '80%',
            data: task,
        });

        this.subscriptions.push(
            dialogRef.afterClosed().subscribe((data: SharplabTaskConfig | null) => {
                // dialog was exited
                if (data === undefined) return;

                const navigationConfig: TaskPlayerNavigationConfig = {
                    metadata: data === null ? task.config : data,
                    mode: 'test',
                };

                this.router.navigate([`${RouteNames.TASKPLAYER}`], { state: navigationConfig });
            })
        );
    }

    get experimentalTasksForTable(): ViewComponentsTableModel<Task> {
        const experimentalTasks = this.taskService.tasksValue.filter(
            (task) => task.taskType === TaskType.EXPERIMENTAL && task.fromPlatform === Platform.PSHARPLAB
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
            ],
            tableData: experimentalTasks,
            msgOnEmpty: 'No NAB Tasks',
            tableTitle: 'Experimental Tasks',
        };
    }

    ngOnDestroy() {
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
