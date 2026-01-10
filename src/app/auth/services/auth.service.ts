import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _isAuthenticated = signal(false);

  isAuthenticated() {
    return this._isAuthenticated();
  }

  login(email: string, password: string) {
    // MOCK – remplacé plus tard par une API
    if (email && password) {
      this._isAuthenticated.set(true);
      localStorage.setItem('auth', 'true');
    }
  }

  logout() {
    this._isAuthenticated.set(false);
    localStorage.removeItem('auth');
  }

  restoreSession() {
    this._isAuthenticated.set(localStorage.getItem('auth') === 'true');
  }
}
