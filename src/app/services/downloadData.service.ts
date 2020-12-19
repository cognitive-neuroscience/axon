import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Role } from '../models/InternalDTOs';
import { AuthService } from './auth.service';
import { ExcelService } from './excel.service';
import { take } from 'rxjs/operators';

@Injectable({
    providedIn: "root"
})
export class DownloadDataService {
    
    private _tableNames: BehaviorSubject<string[]>;

    public tableNames: Observable<string[]>;

    constructor(
        private _http: HttpClient, 
        private authService: AuthService
    ) {
        this._tableNames = new BehaviorSubject(null)
        this.tableNames = this._tableNames.asObservable()
    }

    updateTableNames() {
        // do not get all experiments if role is not auth as it will result in HTTP forbidden
        const jwt = this.authService.getDecodedToken()
        const role = jwt ? jwt.Role : null
        if(role && role === Role.ADMIN) {
            this._getTableNames().pipe(take(1)).subscribe(data => {
                this._tableNames.next(data)
            })
        }
    }

    getTableData(experimentCode: string, taskName: string): Observable<any> {
        return this._http.get(`${environment.apiBaseURL}/download/${experimentCode}/${taskName}`)
    }

    private _getTableNames(): Observable<string[]> {
        return this._http.get<string[]>(`${environment.apiBaseURL}/download`)
    }
}