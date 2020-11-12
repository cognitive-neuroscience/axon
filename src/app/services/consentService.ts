import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
    providedIn: "root"
})
export class ConsentService {

    private readonly route = "/assets/data"

    private _consentSubject: Subject<boolean>

    consentSubject: Observable<boolean>

    constructor(private http: HttpClient) {
        this._consentSubject = new Subject()
        this.consentSubject = this._consentSubject.asObservable()
    }

    loadConsentFormJSON(): Observable<any> {
        return this.http.get(`${this.route}/consent.json`)
    }

    emitResponse(res: boolean): void {
        this._consentSubject.next(res)
    }


}