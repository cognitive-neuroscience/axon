import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/Task';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs/operators';
import { TaskNames } from '../models/TaskData';
import { CanClear } from './clearance.service';

@Injectable({
    providedIn: 'root',
})
export class TaskService implements CanClear {
    // behavior subjects that hold the cached data and act as source of truth
    private _tasksBehaviorSubject: BehaviorSubject<Task[]>;
    get tasks(): Observable<Task[]> {
        return this._tasksBehaviorSubject.asObservable();
    }
    get hasTasks(): boolean {
        return this._tasksBehaviorSubject.value !== null;
    }

    private readonly RESOURCE_PATH = '/tasks';

    // init the behavior subjects
    constructor(private http: HttpClient) {
        this._tasksBehaviorSubject = new BehaviorSubject(null);
    }

    public update() {
        this._getTasks()
            .pipe(take(1))
            .subscribe((tasks) => this._tasksBehaviorSubject.next(tasks));
    }

    private _getTasks(): Observable<Task[]> {
        // return routemap as an array of tasks
        return this.http.get<Task[]>(`${environment.apiBaseURL}${this.RESOURCE_PATH}`);
    }

    getTaskByTaskId(taskId: number): Observable<Task> {
        return this.http.get<Task>(`${environment.apiBaseURL}${this.RESOURCE_PATH}/${taskId}`);
    }

    clearService() {
        if (this._tasksBehaviorSubject.value) {
            this._tasksBehaviorSubject.next(null);
        }
    }
}
