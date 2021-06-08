import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { CustomTask } from "../models/TaskData";

@Injectable({
    providedIn: "root",
})
export class CustomTaskService {
    private readonly RESOURCE_PATH = "/task/";

    private _customTasksSubject: BehaviorSubject<CustomTask[]>;
    public customTasks: Observable<CustomTask[]>;

    constructor(private http: HttpClient) {
        this._customTasksSubject = new BehaviorSubject(null);
        this.customTasks = this._customTasksSubject.asObservable();
    }

    update(): void {
        this._getQuestionnaires().subscribe((questionnaires) => {
            this._customTasksSubject.next(questionnaires);
        });
    }

    createQuestionnaire(questionnaire: CustomTask): Observable<boolean> {
        return this.http
            .post(`${environment.apiBaseURL}${this.RESOURCE_PATH}`, questionnaire, { observe: "response" })
            .pipe(map((x) => x.ok));
    }

    deleteQuestionnaireByID(id: string): Observable<boolean> {
        return this.http
            .delete(`${environment.apiBaseURL}${this.RESOURCE_PATH}${id}`, { observe: "response" })
            .pipe(map((x) => x.ok));
    }

    private _getQuestionnaires(): Observable<CustomTask[]> {
        return this.http.get<CustomTask[]>(`${environment.apiBaseURL}${this.RESOURCE_PATH}`);
    }

    getCustomTaskByID(id: string): Observable<CustomTask> {
        return this.http.get<CustomTask>(`${environment.apiBaseURL}${this.RESOURCE_PATH}${id}`);
    }
}
