import { Injectable } from '@angular/core';
import { TokenStorage } from './token-storage';

@Injectable({ providedIn: 'root' })
export class LocalStorageTokenStorage implements TokenStorage {
    private readonly key = 'accessToken';
    get() { return localStorage.getItem(this.key); }
    set(token: string) { localStorage.setItem(this.key, token); }
    clear() { localStorage.removeItem(this.key); }
}