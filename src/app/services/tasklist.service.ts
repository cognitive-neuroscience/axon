import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/Task';
import { AuthService } from './auth.service';
import { Role, TaskType } from '../models/InternalDTOs';
import { RouteMap } from '../routing/routes';
import { filter, take } from "rxjs/operators";

@Injectable({
    providedIn: "root"
})
export class TasklistService {

    // behavior subjects that hold the cached data and act as source of truth
    private _taskBehaviorSubject: BehaviorSubject<Task[]>;
    private _completedTaskBehaviorSubject: BehaviorSubject<string[]>;

    // exposed observables
    public taskList: Observable<Task[]>;
    public completedTaskList: Observable<string[]>;

    private readonly route = "/assets/data"

    // init the behavior subjects
    constructor(private http: HttpClient, private authService: AuthService) {

        this._taskBehaviorSubject = new BehaviorSubject(null);
        this.taskList = this._taskBehaviorSubject.asObservable();

        this._completedTaskBehaviorSubject = new BehaviorSubject(null);
        this.completedTaskList = this._completedTaskBehaviorSubject.asObservable();
        this._updateCompletedTaskBehaviorSubject()
    }

    public update() {
        const jwt = this.authService.getDecodedToken()
        const role = jwt ? jwt.Role : null

        if(role && (role === Role.ADMIN || role === Role.GUEST)) {
            this._getTasks().subscribe((tasks: Task[]) => {
                const filteredTasks = tasks.filter(task => task.type !== TaskType.Questionnaire);             
                this._taskBehaviorSubject.next(filteredTasks)
            })
        }
    }

    private _updateCompletedTaskBehaviorSubject() {
        this._getCompletedTaskIds().pipe(take(1)).subscribe((completedTasks: string[]) => {
            this._completedTaskBehaviorSubject.next(completedTasks)
        })
    }

    private _getTasks(): Observable<Task[]> {
        // return routemap as an array of tasks
        return of(Object.values(RouteMap));
    }

    private _getCompletedTaskIds(): Observable<string[]> {
        return this.http.get<string[]>(`${this.route}/completedtasklist.json`)
    }
}