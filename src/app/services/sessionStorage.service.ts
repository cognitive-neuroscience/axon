import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SessionStorageService {
    private STUDYID_FOR_REGISTRATION = 'STUDYID_FOR_REGISTRATION';
    private STUDYID_FOR_CURRENTLY_RUNNING_STUDY = 'STUDYID_FOR_CURRENTLY_RUNNING_STUDY';
    private IS_CROWDSOURCED_USER = 'IS_CROWDSOURCED_USER';

    setStudyIdToRegisterInSessionStorage(code: string): void {
        sessionStorage.setItem(this.STUDYID_FOR_REGISTRATION, code);
    }
    getStudyIdToRegisterInSessionStorage(): string | null {
        return sessionStorage.getItem(this.STUDYID_FOR_REGISTRATION);
    }
    removeStudyIdToRegisterInSessionStorage(): void {
        sessionStorage.removeItem(this.STUDYID_FOR_REGISTRATION);
    }

    setCurrentlyRunningStudyIdInSessionStorage(id: string): void {
        sessionStorage.setItem(this.STUDYID_FOR_CURRENTLY_RUNNING_STUDY, id);
    }
    getCurrentlyRunningStudyIdInSessionStorage(): string | null {
        return sessionStorage.getItem(this.STUDYID_FOR_CURRENTLY_RUNNING_STUDY);
    }

    setIsCrowdsourcedUser(bool: boolean): void {
        sessionStorage.setItem(this.IS_CROWDSOURCED_USER, String(bool));
    }
    getIsCrowdsourcedUser(): boolean {
        const isCrowdsourcedUser = sessionStorage.getItem(this.IS_CROWDSOURCED_USER);
        // return true if isCrowdsourcedUser is true, and false otherwise (even if its null)
        return isCrowdsourcedUser === 'true' ? true : false;
    }

    setKVPInSessionStorage(key: string, value: string): void {
        sessionStorage.setItem(key, value);
    }
    getKVPInSessionStorage(key: string): string {
        return sessionStorage.getItem(key);
    }

    clearSessionStorage(fullClear = false): void {
        if (fullClear) {
            sessionStorage.clear();
        } else {
            // make sure we remove all KVPs except for the study id that we want the user to join
            const registerStudyId = this.getStudyIdToRegisterInSessionStorage();
            sessionStorage.clear();
            this.setStudyIdToRegisterInSessionStorage(registerStudyId);
        }
    }
}
