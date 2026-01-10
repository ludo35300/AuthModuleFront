import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _isAuthenticated = signal(false);
  readonly isAuthenticatedSignal = this._isAuthenticated.asReadonly();
  private readonly tokenExpirationTime = signal(0);

  isAuthenticated() {
    return this._isAuthenticated();
  }

  login(email: string, password: string): boolean {
    // MOCK : On simule une vérification d'identifiants
    if(email === 'admin@test.com' && password === '1234'){
      this._isAuthenticated.set(true);
      localStorage.setItem('auth', 'true');
      // plus tard : localStorage.setItem('token', jwt);
      return true;
    }
    return false;
  }

  logout() {
    this._isAuthenticated.set(false);
    localStorage.removeItem('auth');
  }

  restoreSession() {
    this._isAuthenticated.set(localStorage.getItem('auth') === 'true');
  }
  public isTokenValid(): boolean {
    return Date.now() < this.tokenExpirationTime();
  }
  public startAutoRefresh() {
    // Refresh token 5 min avant expiration
    setInterval(() => {
      if (this.isTokenValid() && Date.now() > this.tokenExpirationTime() - 300000) {
        // this.refreshToken();
      }
    }, 60000); // Check toutes les minutes
  }
}
