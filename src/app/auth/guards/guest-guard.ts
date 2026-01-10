import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si déjà authentifié → redirection vers /home
  if (auth.isAuthenticated()) {
    router.navigate(['/home']);
    return false;
  }
  return true;
};
