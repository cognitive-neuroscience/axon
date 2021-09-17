import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteNames, TaskType } from 'src/app/models/enums';
import { Task } from 'src/app/models/Task';
import { QuestionnaireNavigationConfig } from 'src/app/pages/tasks/questionnaire-reader/questionnaire-reader.component';
import { TaskService } from 'src/app/services/task.service';
import { ViewComponentsTableModel } from '../shared/view-components-table/view-components-table.component';

@Component({
    selector: 'app-manage-questionnaires',
    templateUrl: './manage-questionnaires.component.html',
    styleUrls: ['./manage-questionnaires.component.scss'],
})
export class ManageQuestionnairesComponent implements OnInit {
    constructor(private taskService: TaskService, private router: Router) {}

    subscriptions: Subscription[] = [];

    ngOnInit() {
        this.tasks = this.taskService.tasks;
    }

    tasks: Observable<Task[]>;

    get questionnairesForTable(): Observable<ViewComponentsTableModel<Task>> {
        return this.tasks.pipe(
            map((tasks) => (tasks ? tasks.filter((task) => task.taskType === TaskType.QUESTIONNAIRE) : [])),
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
                msgOnEmpty: 'No questionnaires',
                tableTitle: '',
            }))
        );
    }

    previewQuestionnaire(questionnaire: Task) {
        const questionnaireConfig: QuestionnaireNavigationConfig = {
            metadata: questionnaire.config,
            mode: 'test',
        };

        this.router.navigate([`${RouteNames.QUESTIONNAIRE}`], { state: questionnaireConfig });
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
