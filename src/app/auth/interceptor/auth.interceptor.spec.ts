import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken?.() ?? null;

  // Ne rien faire si pas de token
  if (!token) return next(req);

  // Optionnel: ne pas ajouter sur login/register
  // if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};
