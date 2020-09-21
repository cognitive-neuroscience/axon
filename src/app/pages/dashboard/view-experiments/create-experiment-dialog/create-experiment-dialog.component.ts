import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Task } from 'src/app/models/Task';
import { MatDialogRef } from '@angular/material/dialog';
import { TasklistService } from 'src/app/services/tasklist.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Experiment } from 'src/app/models/Experiment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-experiment-dialog',
  templateUrl: './create-experiment-dialog.component.html',
  styleUrls: ['./create-experiment-dialog.component.scss']
})
export class CreateExperimentDialogComponent implements OnInit, OnDestroy {

  tasks: Task[] = [];
  completedTasks: number[] = [];

  private subscriptions: Subscription[] = [];

  experimentForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.maxLength(255)],
    tasks: ['', Validators.required]
  })

  constructor(
    public dialogRef: MatDialogRef<CreateExperimentDialogComponent>,
    private tasklistService: TasklistService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getTasklist()
    this.getCompletedTasklist()
  }

  private getCompletedTasklist(): void {
    this.subscriptions.push(
      this.tasklistService.completedTaskList.subscribe(completedTasks => {
        this.completedTasks = completedTasks
      })
    )
  }

  private getTasklist(): void {
    this.subscriptions.push(
        this.tasklistService.taskList.subscribe(tasklist => {
        this.tasks = tasklist
      })
    )
  }

  // TODO: implement multiple ordered task selection
  sendDataToParent() {
    const assocTask = this.tasks.find(task => {
      const selectedTaskName = this.experimentForm.get("tasks").value
      return task.title === selectedTaskName;
    })

    const experiment = new Experiment(
      this.experimentForm.get("name").value,
      null,
      this.experimentForm.get("description").value,
      [assocTask]
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
