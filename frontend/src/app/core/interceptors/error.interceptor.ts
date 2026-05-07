import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // D-02: Do NOT trigger logout+redirect for auth endpoints.
      // Public auth 401s (wrong credentials) must fall through to the component's
      // inline error handler — otherwise login page loops to itself.
      const isAuthEndpoint =
        req.url.includes('/auth/login') || req.url.includes('/auth/register');

      if (error.status === 401 && !isAuthEndpoint) {
        // D-01: Show session expired toast before redirecting
        toast.error('Sessão expirada. Faça login novamente.');
        // D-03: logout() clears localStorage and navigates to /login
        authService.logout();
        return throwError(() => error);
      }

      // All other errors: show toast with backend error message (existing behavior preserved)
      // Match backend error envelope: { error: string, statusCode: number }
      // error.error is the parsed JSON response body
      // error.error?.error is the "error" field inside that body (the message string)
      const message =
        error.error?.error ??
        error.message ??
        'Unable to connect to the server. Please try again.';

      toast.error(message);
      return throwError(() => error);
    }),
  );
};
