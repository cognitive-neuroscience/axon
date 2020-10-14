import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TaskData } from '../models/TaskData';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UploadDataService {

    constructor(
        private http: HttpClient,
    ) { }

    // TaskData polymorphic object used for all task data
    uploadData(experimentCode: string, taskName: string, taskData: TaskData[]): Observable<HttpResponse<any>> {
        return this.http.post(`${environment.apiBaseURL}/upload/${experimentCode}/${taskName}`, taskData, { observe: "response"})
    }

}
