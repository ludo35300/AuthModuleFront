import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiError, JwtPayload, ResetToken, User } from '../models/auth.model';

/**
 * Mock backend via HttpInterceptor.
 *
 * Objectifs:
 * - Simuler des endpoints auth: /api/auth/*
 * - Simuler un endpoint privé: GET /api/me
 * - Tester les guards/interceptors côté front (401, 409, etc.)
 */
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  // ----------------------------
  // 1) Protection des routes privées
  // ----------------------------
  // Tout ce qui n'est pas /api/auth/* est considéré comme "privé".
  const isAuthEndpoint = req.url.startsWith('/api/auth/');
  if (!isAuthEndpoint) {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return throwError(() => ({
        status: 401,
        error: { message: 'Non authentifié' } satisfies ApiError,
      })).pipe(delay(200));
    }

    // Optionnel mais recommandé pour tester une vraie session expirée.
    if (isJwtExpired(token)) {
      return throwError(() => ({
        status: 401,
        error: { message: 'Session expirée' } satisfies ApiError,
      })).pipe(delay(200));
    }
  }

  // ----------------------------
  // 2) Endpoints AUTH (publics)
  // ----------------------------

  // LOGIN
  if (req.method === 'POST' && req.url === '/api/auth/login') {
    const { email, password } = req.body as { email: string; password: string };

    const user = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user?.password !== password) {
      return throwError(() => ({
        status: 401,
        error: { message: 'Identifiants invalides' } satisfies ApiError,
      })).pipe(delay(600));
    }

    const expSeconds = Math.floor(Date.now() / 1000) + 60 * 60; // +1h
    const token = createFakeJwt({ sub: email, exp: expSeconds });

    return of(new HttpResponse({
      status: 200,
      body: { accessToken: token, user: { email } },
    })).pipe(delay(600));
  }

  // REGISTER
  if (req.method === 'POST' && req.url === '/api/auth/register') {
    const { email, password, firstName, lastName } = req.body as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };

    const exists = usersDb.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return throwError(() => ({
        status: 409,
        error: { message: 'Email déjà utilisé' } satisfies ApiError,
      })).pipe(delay(700));
    }

    usersDb.push({ email, password, firstName, lastName });

    return of(new HttpResponse({ status: 201, body: { ok: true } })).pipe(delay(700));
  }

  // FORGOT PASSWORD
  if (req.method === 'POST' && req.url === '/api/auth/forgot-password') {
    const { email } = req.body as { email: string };

    // Réponse constante: ne pas révéler si l'email existe.
    const user = usersDb.find(u => u.email.toLowerCase() === (email ?? '').toLowerCase());

    if (user) {
      const token = randomToken();
      const exp = Date.now() + 30 * 60 * 1000; // 30 min

      const tokens = loadResetTokens();
      tokens.push({ token, email: user.email, exp, used: false });
      saveResetTokens(tokens);

      console.log(`Reset link: http://localhost:4200/reset-password?token=${token}`);
    }

    return of(new HttpResponse({ status: 200, body: { ok: true } })).pipe(delay(700));
  }

  // RESET PASSWORD
  if (req.method === 'POST' && req.url === '/api/auth/reset-password') {
    const { token, password } = req.body as { token: string; password: string };

    const tokens = loadResetTokens();
    const row = tokens.find(t => t.token === token);

    if (!row || row.used || row.exp < Date.now()) {
      return throwError(() => ({
        status: 400,
        error: { message: 'Lien invalide ou expiré' } satisfies ApiError,
      })).pipe(delay(700));
    }

    const user = usersDb.find(u => u.email.toLowerCase() === row.email.toLowerCase());
    if (!user) {
      return throwError(() => ({
        status: 400,
        error: { message: 'Lien invalide ou expiré' } satisfies ApiError,
      })).pipe(delay(700));
    }

    user.password = password;
    row.used = true;
    saveResetTokens(tokens);

    return of(new HttpResponse({ status: 200, body: { ok: true } })).pipe(delay(700));
  }

  // ----------------------------
  // 3) Endpoints PRIVÉS (exemple)
  // ----------------------------

  // GET /api/me
  if (req.method === 'GET' && req.url === '/api/me') {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    const email = getSubFromJwt(token);
    const user = email ? usersDb.find(u => u.email.toLowerCase() === email.toLowerCase()) : undefined;

    if (!user) {
      return throwError(() => ({
        status: 401,
        error: { message: 'Non authentifié' } satisfies ApiError,
      })).pipe(delay(200));
    }

    return of(new HttpResponse({
      status: 200,
      body: { email: user.email, firstName: user.firstName, lastName: user.lastName },
    })).pipe(delay(400));
  }

  return next(req);
};

/** DB users en mémoire (mock). */
const usersDb: User[] = [
  { email: 'admin@test.com', password: '1234', firstName: 'Ludovic', lastName: 'Randu' },
];

/**
 * Reset tokens persistés: permet d'ouvrir le lien de reset dans un nouvel onglet.
 * `localStorage` est partagé entre onglets pour la même origin. [web:662]
 */
const RESET_DB_KEY = 'mock.resetTokensDb';

function loadResetTokens(): ResetToken[] {
  try {
    const raw = localStorage.getItem(RESET_DB_KEY);
    const tokens = (raw ? (JSON.parse(raw) as ResetToken[]) : []) ?? [];
    const now = Date.now();

    // Nettoyage simple
    const cleaned = tokens.filter(t => !t.used && t.exp > now);
    if (cleaned.length !== tokens.length) saveResetTokens(cleaned);

    return cleaned;
  } catch {
    return [];
  }
}

function saveResetTokens(tokens: ResetToken[]): void {
  localStorage.setItem(RESET_DB_KEY, JSON.stringify(tokens));
}

/** Decode base64url -> JSON (utilisé pour lire le payload JWT). */
function base64UrlDecodeToJson<T>(part: string): T | null {
  try {
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);

    const bin = atob(padded);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0)); // binaire -> octets [web:538]
    const json = new TextDecoder().decode(bytes);

    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function getSubFromJwt(token: string): string | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payload = base64UrlDecodeToJson<JwtPayload>(parts[1]);
  return payload?.sub ?? null;
}

function isJwtExpired(token: string): boolean {
  const parts = token.split('.');
  if (parts.length < 2) return true;
  const payload = base64UrlDecodeToJson<JwtPayload>(parts[1]);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

/** Encode JSON -> base64url (UTF-8 safe) pour fabriquer un JWT mock. */
function base64UrlEncode(obj: unknown): string {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);

  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);

  const b64 = btoa(bin); // btoa attend une "binary string" [web:539]
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function randomToken(): string {
  return crypto
    .getRandomValues(new Uint8Array(32))
    .reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
}

function createFakeJwt(payload: Record<string, unknown>): string {
  const header = { alg: 'none', typ: 'JWT' };
  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
}
