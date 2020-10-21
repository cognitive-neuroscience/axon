import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
@Injectable({
    providedIn: "root"
})
export class ConsentService {

    private _consentSubject: Subject<boolean>

    consentSubject: Observable<boolean>

    constructor() {
        this._consentSubject = new Subject()
        this.consentSubject = this._consentSubject.asObservable()
    }

    emitResponse(res: boolean): void {
        this._consentSubject.next(res)
    }


}