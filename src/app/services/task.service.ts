import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/Task';
import { environment } from 'src/environments/environment';
import { mergeMap, take, tap } from 'rxjs/operators';
import { CanClear } from './clearance.service';

@Injectable({
    providedIn: 'root',
})
export class TaskService implements CanClear {
    // behavior subjects that hold the cached data and act as source of truth
    private _tasksBehaviorSubject: BehaviorSubject<Task[]>;

    get tasksValue(): Task[] {
        return this.hasTasks ? this._tasksBehaviorSubject.value : [];
    }

    get hasTasks(): boolean {
        return this._tasksBehaviorSubject.value !== null;
    }

    private readonly RESOURCE_PATH = '/tasks';

    // init the behavior subjects
    constructor(private http: HttpClient) {
        this._tasksBehaviorSubject = new BehaviorSubject(null);
    }

    getOrUpdateTasks(forceUpdate = false): Observable<Task[]> {
        if (this.hasTasks && !forceUpdate) {
            // this observable will keep omitting values unless we suppress it
            return of(this.tasksValue);
        } else {
            return this._getTasks().pipe(tap((tasks) => this.updateTasksState(tasks)));
        }
    }

    updateTasksState(tasks: Task[]) {
        this._tasksBehaviorSubject.next(tasks);
    }

    private _getTasks(): Observable<Task[]> {
        // return routemap as an array of tasks
        return this.http.get<Task[]>(`${environment.apiBaseURL}${this.RESOURCE_PATH}`);
    }

    getTaskByTaskId(taskId: number): Observable<Task> {
        return this.http.get<Task>(`${environment.apiBaseURL}${this.RESOURCE_PATH}/${taskId}`);
    }

    clearService() {
        this._tasksBehaviorSubject.next(null);
    }
}
