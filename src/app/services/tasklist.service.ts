import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/Task';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: "root"
})
export class TasklistService {

    private readonly route = "/assets/data"

    constructor(private http: HttpClient) {}

    getTasklist(): Observable<Task[]> {
        return this.http.get(`${this.route}/tasklist.json`).pipe(
            map((tasklist: { tasks: Task[]}) => tasklist.tasks)
        )
    }

    getCompletedTaslist(): Observable<string[]> {
        return this.http.get(`${this.route}/completedtasklist.json`) as Observable<string[]>
    }

}