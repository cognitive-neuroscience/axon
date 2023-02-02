import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteNames, TaskType } from 'src/app/models/enums';
import { Task } from 'src/app/models/Task';
import { TaskPlayerNavigationConfig } from 'src/app/pages/tasks/task-playables/task-player/task-player.component';
import { TaskService } from 'src/app/services/task.service';
import { ViewComponentsTableModel } from '../shared/view-components-table/view-components-table.component';

@Component({
    selector: 'app-manage-questionnaires',
    templateUrl: './manage-questionnaires.component.html',
    styleUrls: ['./manage-questionnaires.component.scss'],
})
export class ManageQuestionnairesComponent {
    constructor(private taskService: TaskService, private router: Router) {}

    subscriptions: Subscription[] = [];

    get questionnairesForTable(): ViewComponentsTableModel<Task> {
        const questionnaires = this.taskService.tasksValue.filter((task) => task.taskType === TaskType.QUESTIONNAIRE);
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
            tableData: questionnaires,
            msgOnEmpty: 'No questionnaires',
            tableTitle: '',
        };
    }

    previewQuestionnaire(questionnaire: Task) {
        const config: TaskPlayerNavigationConfig = {
            metadata: questionnaire.config,
            mode: 'test',
        };

        this.router.navigate([`${RouteNames.TASKPLAYER}`], { state: config });
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
