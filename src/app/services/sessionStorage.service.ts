import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root"
})
export class SessionStorageService {

    TOKEN = "token"
    CODE = "code"

    setTokenInSessionStorage(token: string): void {
        sessionStorage.setItem(this.TOKEN, token)
    }

    setExperimentCodeInSessionStorage(code: string): void {
        sessionStorage.setItem(this.CODE, code)
    }

    // returns null if no token
    getTokenFromSessionStorage(): string {
        return sessionStorage.getItem(this.TOKEN)
    }

    getExperimentCodeFromSessionStorage(): string {
        return sessionStorage.getItem(this.CODE)
    }

    clearSessionStorage(): void {
        sessionStorage.clear()
    }
}