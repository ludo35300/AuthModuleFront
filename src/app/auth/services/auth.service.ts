import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtPayload, LoginResponse, MeResponse, RegisterRequest } from '../models/auth.model';
/**
 * Service d'authentification (mode mock-friendly).
 *
 * Responsabilités:
 * - Exposer l'état "authentifié" via signal.
 * - Gérer le token (localStorage) + expiration.
 * - Fournir les appels HTTP auth (login/register/forgot/reset).
 *
 * Notes:
 * - Le "refresh token" n'est pas implémenté tant que le backend n'existe pas.
 * - Le token est considéré valide si Date.now() < expMs (stocké au login).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Clés de stockage local (une seule source de vérité). */
  private static readonly STORAGE = { token: 'accessToken', expMs: 'accessTokenExpMs', legacyAuth: 'auth'} as const;
  /** Etat auth exposé aux composants. */
  private readonly _isAuthenticated = signal(false);
  public readonly isAuthenticatedSignal = this._isAuthenticated.asReadonly();
  /** Timestamp (ms) d'expiration du token. */
  private readonly tokenExpMs = signal<number>(0);
  /** Injection des dépendances*/
  private readonly http = inject(HttpClient);

  /**
   * Retourne l'état d'auth courant (snapshot).
   * Préférer le signal `isAuthenticatedSignal` côté template.
   */
  public isAuthenticated() {
    return this._isAuthenticated();
  }
  /**
   * Appel login (HTTP).
   * Stocke le token et son expiration (issue du JWT exp) via un effet de bord `tap`.
   */
  public loginHttp(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap((res) => {
        const expMs = this.getExpMsFromJwt(res.accessToken) ?? (Date.now() + 60 * 60 * 1000);
        this.setSession(res.accessToken, expMs);
      })
    );
  }
  /**
   * Appel register (HTTP).
   * (Le login auto après register se fait côté composant, si souhaité.)
   */
  public registerHttp(payload: RegisterRequest) {
    return this.http.post<{ ok: true }>('/api/auth/register', payload);
  }
  /**
   * Démarre le flow "forgot password".
   * Le backend devrait répondre 200 même si le compte n'existe pas (message générique).
   */
  public forgotPasswordHttp(email: string): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>('/api/auth/forgot-password', { email });
  }
  /**
   * Termine le reset: envoie le token de reset + nouveau mot de passe.
   */
  public resetPasswordHttp(token: string, password: string): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>('/api/auth/reset-password', { token, password });
  }
  /**
   * Déconnecte l'utilisateur et nettoie le stockage.
   */
  public logout(): void {
    this._isAuthenticated.set(false);
    this.tokenExpMs.set(0);

    localStorage.removeItem(AuthService.STORAGE.token);
    localStorage.removeItem(AuthService.STORAGE.expMs);
    localStorage.removeItem(AuthService.STORAGE.legacyAuth);
  }
  /**
   * Restaure la session au démarrage (AppComponent / app initializer).
   * - Mode principal: token + expMs.
   * - Fallback legacy: `auth=true` (si tu en as encore besoin).
   */
  public restoreSession(): void {
    const token = localStorage.getItem(AuthService.STORAGE.token);
    const expMs = Number(localStorage.getItem(AuthService.STORAGE.expMs) ?? '0');

    if (token && expMs && Date.now() < expMs) {
      this.tokenExpMs.set(expMs);
      this._isAuthenticated.set(true);
      return;
    }
    // Legacy fallback (à supprimer quand tout le code est migré).
    this._isAuthenticated.set(localStorage.getItem(AuthService.STORAGE.legacyAuth) === 'true');
  }
  /**
   * Retourne le token courant (ou null).
   * Utile pour un HttpInterceptor "auth header" plus tard.
   */
  public getAccessToken(): string | null {
    return localStorage.getItem(AuthService.STORAGE.token);
  }
  /**
   * Indique si le token est encore valide au regard de son expiration.
   */
  public isTokenValid(): boolean {
    const exp = this.tokenExpMs();
    return !!exp && Date.now() < exp;
  }
  /**
   * Stocke le token + expiration en localStorage, et met à jour l'état.
   */
  private setSession(accessToken: string, expMs: number): void {
    localStorage.setItem(AuthService.STORAGE.token, accessToken);
    localStorage.setItem(AuthService.STORAGE.expMs, String(expMs));

    // Legacy (optionnel): si tu as encore des guards basés dessus.
    localStorage.setItem(AuthService.STORAGE.legacyAuth, 'true');

    this.tokenExpMs.set(expMs);
    this._isAuthenticated.set(true);
  }
  /**
   * Extrait le champ exp (en secondes) depuis un JWT et le convertit en ms.
   * Retourne null si token invalide / payload non décodable / exp manquant.
   */
  private getExpMsFromJwt(token: string): number | null {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = this.base64UrlDecodeToJson<JwtPayload>(parts[1]);
    if (!payload?.exp) return null;

    return payload.exp * 1000;
  }
  /**
   * Décode une partie base64url vers JSON.
   * (Utilisé uniquement pour lire le payload JWT.)
   */
  private base64UrlDecodeToJson<T>(part: string): T | null {
    try {
      const b64 = part.replaceAll('-', '+').replaceAll('_', '/');
      const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);

      // atob -> "binary string" -> UTF-8 string
      const bin = atob(padded);
      const bytes = Uint8Array.from(bin, (c) => c.codePointAt(0)!);
      const json = new TextDecoder().decode(bytes);

      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
  /**
   * Squelette: vérifie périodiquement si on est proche de l'expiration.
   * Remarque: tant qu'il n'existe pas de refresh endpoint, ça ne fait rien.
   */
  public startAutoRefresh(): void {
    setInterval(() => {
      const exp = this.tokenExpMs();
      if (!exp) return;

      // Fenêtre de refresh: 5 minutes avant expiration
      const refreshWindow = exp - 5 * 60 * 1000;
      if (Date.now() > refreshWindow && this.isTokenValid()) {
        // TODO: implémenter refresh quand le backend sera prêt.
      }
    }, 60 * 1000);
  }

  public getMeHttp() {
    return this.http.get<MeResponse>('/api/me');
  }
}