import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { ParticipantData, TaskData } from "../models/TaskData";
import { Observable } from "rxjs";
import { TimerService } from "./timer.service";

@Injectable({
    providedIn: "root",
})
export class ParticipantDataService {
    private readonly RESOURCE_PATH = "/studydata";

    constructor(private http: HttpClient, private timerService: TimerService) {}

    // TaskData polymorphic object used for all task data
    uploadTaskData(
        userId: number,
        studyId: number,
        taskOrder: number,
        taskData: TaskData[]
    ): Observable<HttpResponse<any>> {
        const participantData: ParticipantData = {
            userId: userId,
            studyId: studyId,
            taskOrder: taskOrder,
            submittedAt: this.timerService.getCurrentTimestamp(),
            data: taskData,
        };

        return this.http.post(`${environment.apiBaseURL}/${this.RESOURCE_PATH}/`, participantData, {
            observe: "response",
        });
    }

    getParticipantData(studyId: number, taskOrder: number): Observable<ParticipantData[]> {
        return this.http.get<ParticipantData[]>(
            `${environment.apiBaseURL}/${this.RESOURCE_PATH}/${studyId}/${taskOrder}`
        );
    }
}
