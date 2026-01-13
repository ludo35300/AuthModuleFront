import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
/**
 * Guard: protège les routes privées.
 * Si non authentifié, redirige vers /login en conservant l'URL demandée.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isTokenValid()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};