import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';
/**
 * Ajoute automatiquement `Authorization: Bearer <token>` aux appels API
 * quand un token existe.
 *
 * Bonnes pratiques:
 * - Ne pas injecter le token sur les endpoints d'auth (login/register/forgot/reset).
 * - Limiter aux URLs API (ex: /api/...) pour éviter d'envoyer un token ailleurs.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Applique uniquement aux appels API internes
  if (!req.url.startsWith('/api/')) return next(req);
  // Ne jamais ajouter Authorization sur les endpoints auth
  if (req.url.startsWith('/api/auth/')) return next(req);

  const auth = inject(AuthService);
  const token = auth.getAccessToken();
  if (!token) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` }}));
};