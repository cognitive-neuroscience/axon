import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root"
})
export class LocalStorageService {

    TOKEN = "token"

    setTokenInLocalStorage(token: string): void {
        localStorage.setItem(this.TOKEN, token)
    }

    // returns null if no token
    getTokenFromLocalStorage(): string {
        return localStorage.getItem(this.TOKEN)
    }

    clearLocalStorage(): void {
        localStorage.clear()
    }
}