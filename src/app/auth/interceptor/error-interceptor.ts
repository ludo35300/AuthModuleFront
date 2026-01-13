import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
/**
 * Interceptor global d'erreurs HTTP.
 *
 * - Si 401/403 sur une route API protégée:
 *   - logout (clear token)
 *   - redirection vers /login?returnUrl=<urlCourante>
 *
 * Remarque:
 * - À activer surtout quand le backend renvoie de vrais 401/403.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        // Ne pas traiter les endpoints d'auth (sinon boucle possible)
        const isAuthEndpoint = req.url.startsWith('/api/auth/');

        if (!isAuthEndpoint && (err.status === 401 || err.status === 403)) {
          auth.logout();

          // URL actuelle pour revenir après login
          const returnUrl = router.url;
          router.navigate(['/login'], { queryParams: { returnUrl } });
        }
      }

      return throwError(() => err);
    })
  );
};
