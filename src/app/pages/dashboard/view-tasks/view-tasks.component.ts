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

  private readonly COMPLETED_TASKS: string[] = [
    "Stroop Task",
    "TS & DST",
  ]

  displayedColumnsForExperiments = ['title', 'description', 'route'];

  tasklist: Task[];

  constructor(
    private router: Router,
    private tasklistService: TasklistService
  ) {}

  ngOnInit() {
    this.tasklist = [];
    this.getTasklist();
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
    return this.COMPLETED_TASKS.includes(task) ? true : false
  }

}
