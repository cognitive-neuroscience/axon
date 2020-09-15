import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root"
})
export class LocalStorageService {

    setLocalStorage(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    getItemFromLocalStorage(key: string): string {
        return localStorage.getItem(key)
    }

    clearLocalStorage(): void {
        localStorage.clear()
    }
}