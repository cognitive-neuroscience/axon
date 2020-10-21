import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TasklistService } from 'src/app/services/tasklist.service';
import { Task, TaskRoute } from 'src/app/models/Task';

@Component({
  selector: 'app-view-tasks',
  templateUrl: './view-tasks.component.html',
  styleUrls: ['./view-tasks.component.scss']
})
export class ViewTasksComponent implements OnInit {

  // contains Ids of completed tasks
  completedTasks: number[] = []

  displayedColumnsForExperiments = ['title', 'description', 'route'];

  taskRoutes: TaskRoute[] = []

  tasklist: Task[] = []

  constructor(
    private router: Router,
    private tasklistService: TasklistService
  ) {}

  ngOnInit() {
    this.tasklistService.updateTasks()
    this.getCompletedTasklist();
    this.getTasklist();
    this.getTaskRoutes();
  }

  private getCompletedTasklist(): void {
    this.tasklistService.completedTaskList.subscribe(completedTasks => {
      this.completedTasks = completedTasks
    })
  }

  private getTasklist(): void {
    this.tasklistService.taskList.subscribe(tasks => {
      this.tasklist = tasks
    })
  }

  private getTaskRoutes(): void {
    this.tasklistService.taskRouteList.subscribe(taskRoutes => {
      this.taskRoutes = taskRoutes
    })
  }

  run(task: Task) {
    const taskRoute = this.taskRoutes.find(route => route.id === task.id)
    if(taskRoute) {
      this.router.navigate([taskRoute.route]);
    }
  }

  get tasks() {    
    return this.tasklist ? this.tasklist.filter(t => t.type === 'NAB') : []
  }

  get experiments() {
    return this.tasklist ? this.tasklist.filter(t => t.type === 'experimental') : []
  }

  // applies styling and disabled incomplete tasks. For now, we want to make them accessible
  taskIsComplete(task: Task): boolean {
    return true
    // if(!this.completedTasks || !task || !task.id) return false
    // return this.completedTasks.includes(task.id) ? true : false
  }

}
