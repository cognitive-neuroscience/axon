import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteNames, TaskType } from 'src/app/models/enums';
import { Task } from 'src/app/models/Task';
import { ReaderNavigationConfig } from 'src/app/pages/tasks/shared/base-reader';
import { TaskService } from 'src/app/services/task.service';
import { ViewComponentsTableModel } from '../shared/view-components-table/view-components-table.component';

@Component({
    selector: 'app-view-consents',
    templateUrl: './view-consents.component.html',
    styleUrls: ['./view-consents.component.scss'],
})
export class ViewConsentsComponent {
    constructor(private taskService: TaskService, private router: Router) {}

    get consentsForTable(): Observable<ViewComponentsTableModel<Task>> {
        return this.taskService.tasks.pipe(
            map((tasks) => (tasks ? tasks.filter((task) => task.taskType === TaskType.CONSENT) : [])),
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
                msgOnEmpty: 'No consent forms to display',
                tableTitle: '',
            }))
        );
    }

    showConsent(consent: Task) {
        const infoDisplayConfig: ReaderNavigationConfig = {
            metadata: consent.config,
            mode: 'test',
        };

        this.router.navigate([`${RouteNames.CONSENT}`], { state: infoDisplayConfig });
    }
}
