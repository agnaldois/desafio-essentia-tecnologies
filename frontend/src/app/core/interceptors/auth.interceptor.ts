import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Attaches JWT Bearer token to every outgoing request.
// D-02: public auth endpoints (/auth/login, /auth/register) receive the header too
// but it is harmless — the backend ignores it for public routes. The 401 protection
// concern lives in errorInterceptor (not here).
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};
