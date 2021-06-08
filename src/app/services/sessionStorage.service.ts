import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class SessionStorageService {
    private TOKEN = "token";
    private CODE = "code";

    setTokenInSessionStorage(token: string): void {
        sessionStorage.setItem(this.TOKEN, token);
    }

    setStudyCodeInSessionStorage(code: string): void {
        sessionStorage.setItem(this.CODE, code);
    }

    // returns null if no token
    getTokenFromSessionStorage(): string {
        return sessionStorage.getItem(this.TOKEN);
    }

    getStudyCodeFromSessionStorage(): string {
        return sessionStorage.getItem(this.CODE);
    }

    clearSessionStorage(): void {
        sessionStorage.clear();
    }
}
