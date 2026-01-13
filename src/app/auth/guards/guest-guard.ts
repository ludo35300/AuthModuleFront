import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
/**
 * Guard: protège les routes "guest-only" (login/register/forgot...).
 * Si déjà authentifié, redirige vers /home.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = auth.isTokenValid();    // ou alors auth.isAuthenticated() ?
  return isLoggedIn ? router.createUrlTree(['/home']) : true;
};
