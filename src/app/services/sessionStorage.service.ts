import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class SessionStorageService {
    private STUDYID = "STUDYID";

    setStudyIdInSessionStorage(code: string): void {
        sessionStorage.setItem(this.STUDYID, code);
    }

    getStudyIdFromSessionStorage(): string {
        return sessionStorage.getItem(this.STUDYID);
    }

    clearSessionStorage(): void {
        sessionStorage.clear();
    }
}
