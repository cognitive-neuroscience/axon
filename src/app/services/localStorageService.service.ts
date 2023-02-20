import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    private readonly USER_ID_KEY_STRING = 'PSHARPLAB_USER_ID';

    setUserIdInLocalStorage(userId: string): void {
        localStorage.setItem(this.USER_ID_KEY_STRING, userId);
    }
    getUserIdInLocalStorage(): string | null {
        return localStorage.getItem(this.USER_ID_KEY_STRING);
    }
    removeUserIdFromLocalStorage(): void {
        localStorage.removeItem(this.USER_ID_KEY_STRING);
    }
}
