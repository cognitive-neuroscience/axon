import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    private readonly USER_ID_KEY_STRING = 'PSHARPLAB_USER_ID';
    private readonly FAVORITES_FOR_USER_STRING = `PSHARPLAB_FAVORITES_`;

    setUserIdInLocalStorage(userId: string): void {
        localStorage.setItem(this.USER_ID_KEY_STRING, userId);
    }
    getUserIdInLocalStorage(): string | null {
        return localStorage.getItem(this.USER_ID_KEY_STRING);
    }
    removeUserIdFromLocalStorage(): void {
        localStorage.removeItem(this.USER_ID_KEY_STRING);
    }

    getFavoritesInLocalStorage(): number[] {
        const userId = this.getUserIdInLocalStorage();
        if (!userId) return [];

        const favorites = localStorage.getItem(`${this.FAVORITES_FOR_USER_STRING}${userId}`);
        return JSON.parse(favorites) || [];
    }
    setFavoritesInLocalStorage(favorites: number[]): void {
        const userId = this.getUserIdInLocalStorage();
        if (!userId) return;

        localStorage.setItem(`${this.FAVORITES_FOR_USER_STRING}${userId}`, JSON.stringify(favorites));
    }
}
