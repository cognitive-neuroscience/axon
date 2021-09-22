import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteNames, TaskType } from 'src/app/models/enums';
import { Task } from 'src/app/models/Task';
import { ReaderNavigationConfig } from 'src/app/pages/tasks/shared/base-reader';
import { TaskService } from 'src/app/services/task.service';
import { ViewComponentsTableModel } from '../shared/view-components-table/view-components-table.component';

@Component({
    selector: 'app-view-info-displays',
    templateUrl: './view-info-displays.component.html',
    styleUrls: ['./view-info-displays.component.scss'],
})
export class ViewInfoDisplaysComponent implements OnInit {
    tasks: Observable<Task[]>;

    constructor(private taskService: TaskService, private router: Router) {}

    ngOnInit() {
        this.tasks = this.taskService.tasks;
    }

    get infoDisplaysForTable(): Observable<ViewComponentsTableModel<Task>> {
        return this.tasks.pipe(
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
        const infoDisplayConfig: ReaderNavigationConfig = {
            metadata: infoDisplay.config,
            mode: 'test',
        };

        this.router.navigate([`${RouteNames.INFO_DISPLAY}`], { state: infoDisplayConfig });
    }
}
