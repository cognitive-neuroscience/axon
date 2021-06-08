import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Role } from "../models/enums";
import { AuthService } from "./auth.service";
import { ExcelService } from "./excel.service";
import { take } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class DownloadDataService {
    constructor(private _http: HttpClient) {}
    getTableData(studyCode: string, taskName: string): Observable<any> {
        return this._http.get(`${environment.apiBaseURL}/download/${studyCode}/${taskName}`);
    }
}
