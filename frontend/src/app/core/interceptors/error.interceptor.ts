import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
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
