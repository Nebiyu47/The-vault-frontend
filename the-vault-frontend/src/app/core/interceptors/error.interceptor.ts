import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  
  return next(req).pipe(
    catchError(error => {
      let errorMessage = 'An error occurred';
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show validation errors if present
      if (error.error?.validationErrors) {
        const validationErrors = error.error.validationErrors;
        Object.keys(validationErrors).forEach(key => {
          toastr.error(`${key}: ${validationErrors[key]}`);
        });
      } else {
        // Don't show error for 401 on refresh
        if (!(error.status === 401 && req.url.includes('/auth/refresh'))) {
          toastr.error(errorMessage);
        }
      }
      
      return throwError(() => error);
    })
  );
};