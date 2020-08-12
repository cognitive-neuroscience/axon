import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TasklistService } from 'src/app/services/tasklist.service';
import { Task } from 'src/app/models/Task';

@Component({
  selector: 'app-view-tasks',
  templateUrl: './view-tasks.component.html',
  styleUrls: ['./view-tasks.component.scss']
})
export class ViewTasksComponent implements OnInit {

  completedTasks: string[] = []

  displayedColumnsForExperiments = ['title', 'description', 'route'];

  tasklist: Task[] = []

  constructor(
    private router: Router,
    private tasklistService: TasklistService
  ) {}

  ngOnInit() {
    this.getCompletedTasklist();
    this.getTasklist();
  }

  private getCompletedTasklist(): void {
    this.tasklistService.getCompletedTaslist().subscribe(completedTasklist => {
      this.completedTasks = completedTasklist
    })
  }

  private getTasklist(): void {
    this.tasklistService.getTasklist().subscribe(receivedTasklist => {
      this.tasklist = receivedTasklist
    })
  }

  run(path: string) {
    this.router.navigate([path]);
  }

  get tasks() {
    return this.tasklist.filter(t => t.type === 'NAB')
  }

  get experiments() {
    return this.tasklist.filter(t => t.type === 'experimental');
  }

  taskIsComplete(task: string): boolean {
    return this.completedTasks.includes(task) ? true : false
  }

}
