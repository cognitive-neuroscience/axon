import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SessionStorageService {
    private STUDYID = 'STUDYID';

    setStudyIdInSessionStorage(code: string): void {
        sessionStorage.setItem(this.STUDYID, code);
    }

    getStudyIdFromSessionStorage(): string | null {
        return sessionStorage.getItem(this.STUDYID);
    }

    setKVPInSessionStorage(key: string, value: string): void {
        sessionStorage.setItem(key, value);
    }

    getValueByKeyFromSessionStorage(key: string): string {
        return sessionStorage.getItem(key);
    }

    clearSessionStorage(): void {
        sessionStorage.clear();
    }
}
