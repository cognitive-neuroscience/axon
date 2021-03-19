import { Component, OnInit, OnDestroy } from '@angular/core';
import { Task } from 'src/app/models/Task';
import { MatDialogRef } from '@angular/material/dialog';
import { TasklistService } from 'src/app/services/tasklist.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Experiment } from 'src/app/models/Experiment';
import { Observable, Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SnackbarService } from '../../../../services/snackbar.service';
import { Questionnaire } from 'src/app/models/Questionnaire';
import { QuestionnaireService } from 'src/app/services/questionnaire.service';
import { TaskType } from 'src/app/models/InternalDTOs';
import { RouteMap } from 'src/app/routing/routes';
import { CustomTask } from '../../../../models/TaskData';
import { CustomTaskService } from '../../../../services/custom-task.service';
import { MatSelectChange } from '@angular/material/select';

export enum ArrayChange {
  REMOVED,
  ADDED
}

export class ArrayChangeObject {
  change: ArrayChange;
  item: ListItem;
}

// generic list item to combine questionnaires and tasks
export class ListItem {
  displayName: string;
  id: string;
  type: TaskType
}

@Component({
  selector: 'app-create-studies-dialog',
  templateUrl: './create-studies-dialog.component.html',
  styleUrls: ['./create-studies-dialog.component.scss']
})
export class CreateStudiesDialogComponent implements OnInit, OnDestroy {

  tasks: Observable<Task[]>;
  completedTasks: string[] = [];
  selectedTasks: ListItem[] = [];
  customTasks: Observable<CustomTask[]>;
  questionnaires: Observable<Questionnaire[]>;

  private subscriptions: Subscription[] = [];

  experimentForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.maxLength(255)],
  })

  constructor(
    public dialogRef: MatDialogRef<CreateStudiesDialogComponent>,
    private tasklistService: TasklistService,
    private fb: FormBuilder,
    private questionnaireService: QuestionnaireService,
    private customTaskService: CustomTaskService
  ) {}

  ngOnInit(): void {
    this.questionnaires = this.questionnaireService.questionnaires;
    this.customTasks = this.customTaskService.customTasks;
    this.tasks = this.tasklistService.taskList;
    this.tasklistService.update();
    this.questionnaireService.update();
    this.customTaskService.update();

    this.getCompletedTasklist();
  }

  handleSelection(event: Questionnaire | Task | CustomTask) {
    const listItem = this.convertToListItem(event);
    this.selectedTasks.push(listItem);
  }

  private convertToListItem(task): ListItem {
    if(task["title"]) {
      // for task objects
      return {
        displayName: task["title"],
        id: task["id"],
        type: RouteMap[task["id"]].type
      }
    } else if(task["customTaskID"]) {
      // for custom tasks
      return {
        displayName: task["name"],
        id: task["customTaskID"],
        type: TaskType.CustomTask
      }
    } else {
      // for questionnaire objects
      return {
        displayName: task["name"],
        id: task["questionnaireID"],
        type: TaskType.Questionnaire
      }
    }
  }

  private getCompletedTasklist(): void {
    this.subscriptions.push(
      this.tasklistService.completedTaskList.subscribe(completedTasks => {
        this.completedTasks = completedTasks
      })
    )
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedTasks, event.previousIndex, event.currentIndex)
  }

  removeElement(index: number) {
    this.selectedTasks.splice(index, 1);
  }

  sendDataToParent() {
    const experiment = new Experiment(
      this.experimentForm.get("name").value,
      null, // code is populated in the backend
      this.experimentForm.get("description").value,
      this.selectedTasks.map(x => {
        switch (x.type) {
          case TaskType.Experimental:
          case TaskType.NAB:
            return x.id;
          case TaskType.CustomTask:
            return `${RouteMap.pavloviatask.id}-${x.id}`;
          case TaskType.Questionnaire:
            // questionnaires that we have hard coded on the frontend vs embedded survey monkey questionnaires
            return this.questionnaireService.includedRouteMapQuestionnaires.includes(x.id) ? x.id : `${RouteMap.surveymonkeyquestionnaire.id}-${x.id}`;
          default:
            // should never get here
            console.error("No task type found");
            throw new Error("No task type found!");
        }
      })
    )
    this.dialogRef.close({experiment})
  }

  taskIsComplete(task: Task): boolean {
    if(this.completedTasks) {
      return this.completedTasks.includes(task.id) ? true : false
    } else {
      return false
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
