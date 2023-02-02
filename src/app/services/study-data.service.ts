import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ParticipantData, BaseParticipantData } from '../models/ParticipantData';
import { Observable } from 'rxjs';
import { TimerService } from './timer.service';
import { ParticipantType } from '../models/enums';

@Injectable({
    providedIn: 'root',
})
export class ParticipantDataService {
    private readonly RESOURCE_PATH = '/participantdata';

    constructor(private http: HttpClient, private timerService: TimerService) {}

    // TaskData polymorphic object used for all task data
    createParticipantData(
        userId: string,
        studyId: number,
        taskOrder: number,
        isCrowdsourcedUser: boolean,
        taskData: BaseParticipantData[] | { [key: string]: any }[]
    ): Observable<HttpResponse<any>> {
        const participantData: ParticipantData = {
            userId: userId,
            studyId: studyId,
            taskOrder: taskOrder,
            participantType: isCrowdsourcedUser ? ParticipantType.CROWDSOURCED : ParticipantType.ACCOUNTHOLDER,
            submittedAt: this.timerService.getCurrentTimestamp(),
            data: taskData,
        };

        return this.http.post(`${environment.apiBaseURL}${this.RESOURCE_PATH}`, participantData, {
            observe: 'response',
        });
    }

    getParticipantData(studyId: number, taskOrder: number): Observable<ParticipantData[]> {
        return this.http.get<ParticipantData[]>(
            `${environment.apiBaseURL}${this.RESOURCE_PATH}/${studyId}/${taskOrder}`
        );
    }
}
