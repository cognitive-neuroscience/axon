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

    loadWebPhenoPilotConsentFormJSON(): Observable<any> {
        return this.http.get(`${this.route}/webPheno_Pilot.json`)
    }

    loadStressClinicalDebriefFormJSON(): Observable<any> {
        return this.http.get(`${this.route}/stressClinicalDebrief.json`)
    }

    loadWebPhenoClinicalConsentFormJSON(): Observable<any> {
        return this.http.get(`${this.route}/webPheno_Clinical.json`)
    }

    loadWebPhenoFRClinicalConsentFormJSON(): Observable<any> {
        return this.http.get(`${this.route}/webPheno_Clinical_FR.json`)
    }

    loadStressClinicalConsentFormJSON(): Observable<any> {
        return this.http.get(`${this.route}/stress_Clinical.json`)
    }

    loadStressClinicalFRConsentFormJSON(): Observable<any> {
        return this.http.get(`${this.route}/stress_Clinical_FR.json`)
    }

    loadStressPilotConsentFormJSON(): Observable<any> {
        return this.http.get(`${this.route}/stress_Pilot.json`)
    }

    load(): Observable<any> {
        return this.http.get(`${this.route}/stressClinicalDebrief.json`)
    }

    emitResponse(res: boolean): void {
        this._consentSubject.next(res)
    }


}