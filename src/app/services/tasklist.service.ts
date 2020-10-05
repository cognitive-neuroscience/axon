import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Task, TaskRoute } from '../models/Task';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Role } from '../models/InternalDTOs';

@Injectable({
    providedIn: "root"
})
export class TasklistService {

    // behavior subjects that hold the cached data and act as source of truth
    private _taskBehaviorSubject: BehaviorSubject<Task[]>;
    private _taskRouteBehaviorSubject: BehaviorSubject<TaskRoute[]>;
    private _completedTaskBehaviorSubject: BehaviorSubject<number[]>;

    // exposed observables
    public taskList: Observable<Task[]>;
    public taskRouteList: Observable<TaskRoute[]>;
    public completedTaskList: Observable<number[]>;

    private readonly route = "/assets/data"

    // init the behavior subjects
    constructor(private http: HttpClient, private authService: AuthService) {
        const jwt = this.authService.getDecodedToken()
        const role = jwt ? jwt.Role : null

        this._taskBehaviorSubject = new BehaviorSubject(null);
        this.taskList = this._taskBehaviorSubject.asObservable();
        if(role && role === Role.ADMIN) this.updateTasks()

        this._taskRouteBehaviorSubject = new BehaviorSubject(null);
        this.taskRouteList = this._taskRouteBehaviorSubject.asObservable();
        this._updateTaskRouteBehaviorSubject()

        this._completedTaskBehaviorSubject = new BehaviorSubject(null);
        this.completedTaskList = this._completedTaskBehaviorSubject.asObservable();
        this._updateCompletedTaskBehaviorSubject()
    }

    public updateTasks() {
        this._getTasks().subscribe((tasks: Task[]) => {
            this._taskBehaviorSubject.next(tasks)
        })
    }

    private _updateTaskRouteBehaviorSubject() {
        this._getTaskRoutes().subscribe((taskRoutes: TaskRoute[]) => {
            this._taskRouteBehaviorSubject.next(taskRoutes)
        })
    }

    private _updateCompletedTaskBehaviorSubject() {
        this._getCompletedTaskIds().subscribe((completedTasks: number[]) => {
            this._completedTaskBehaviorSubject.next(completedTasks)
        })
    }

    private _getTasks() {
        return this.http.get(`${environment.apiBaseURL}/tasks`)
    }

    private _getTaskRoutes() {
        return this.http.get(`${this.route}/tasklist.json`)
    }

    private _getCompletedTaskIds() {
        return this.http.get(`${this.route}/completedtasklist.json`)
    }
}