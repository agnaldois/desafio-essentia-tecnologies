import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Functional route guard — blocks /tasks for unauthenticated users (AUTH-05).
// Returns UrlTree to /login rather than imperative router.navigate() for composability.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
