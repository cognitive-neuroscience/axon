import { Component, OnInit, Input } from '@angular/core';
import { Task } from 'src/app/models/Task';
import { MatDialogRef } from '@angular/material/dialog';
import { TasklistService } from 'src/app/services/tasklist.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Experiment } from 'src/app/models/Experiment';

@Component({
  selector: 'app-create-experiment-dialog',
  templateUrl: './create-experiment-dialog.component.html',
  styleUrls: ['./create-experiment-dialog.component.scss']
})
export class CreateExperimentDialogComponent implements OnInit {

  tasks: Task[] = [];

  completedTasks: string[] = [];

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
    this.tasklistService.getCompletedTaslist().subscribe(completedTasklist => {
      this.completedTasks = completedTasklist
    })
  }

  private getTasklist(): void {
    this.tasklistService.getTasklist().subscribe(receivedTasklist => {
      this.tasks = receivedTasklist
    })
  }

  sendDataToParent() {
    const assocTask = this.tasks.find(task => {
      const selectedTask = this.experimentForm.get("tasks").value
      return task.title === selectedTask;
    })

    const experiment = new Experiment(
      this.experimentForm.get("name").value,
      null,
      this.experimentForm.get("description").value,
      [
        assocTask
      ]
    )
    this.dialogRef.close({experiment})
  }

  taskIsComplete(task: string): boolean {
    return this.completedTasks.includes(task) ? true : false
  }
}
