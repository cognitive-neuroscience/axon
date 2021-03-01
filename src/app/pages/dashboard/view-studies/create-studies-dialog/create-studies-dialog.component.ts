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
import { map } from 'rxjs/operators';

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
    tasks: [[], Validators.required]
  })

  constructor(
    public dialogRef: MatDialogRef<CreateStudiesDialogComponent>,
    private tasklistService: TasklistService,
    private fb: FormBuilder,
    private _snackbar: SnackbarService,
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
    this.subscriptions.push(
      // tasks will be either of type Questionnaire or Task
      this.experimentForm.get("tasks").valueChanges.pipe(
        map((tasks: any[]) => tasks.map(this.convertToListItem))
      ).subscribe((listItems) => {
        this.handleSelectChange(listItems)
      })
    )
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

  handleSelectChange(newTasks: ListItem[]) {
    const change = this._findDifference(this.selectedTasks, newTasks)
    switch (change.change) {
      case ArrayChange.ADDED:
        this.selectedTasks.push(change.item)
        break;
      case ArrayChange.REMOVED:
        const indexOfRemovedItem = this.selectedTasks.findIndex(x => x.id === change.item.id)
        this.selectedTasks.splice(indexOfRemovedItem, 1)
        break;
      default:
        // we should never reach here
        console.error("ArrayChange option not found")
        this._snackbar.openErrorSnackbar("There was an error")
        break;
    }
  }

  // takes in 2 arrays and returns the single change between the two
  private _findDifference(oldArr: ListItem[], newArr: ListItem[]): ArrayChangeObject {
    // will either be 1 or -1 since only one change occurs at a time
    const sizeDiff = newArr.length - oldArr.length
    // element has been added to the array
    if(sizeDiff > 0) {
      // !<some-string> is false, !undefined is true so we search through
      // until we come across a string in newArr that is not found in oldArr
      const task = newArr.find(x => !oldArr.find(y => x.id === y.id))

      return {
        change: ArrayChange.ADDED,
        item: task
      }
    } else {
      // element has been removed from the array

      // same logic as above, but reversed
      const task = oldArr.find(x => !newArr.find(y => x.id === y.id))

      return {
        change: ArrayChange.REMOVED,
        item: task
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
