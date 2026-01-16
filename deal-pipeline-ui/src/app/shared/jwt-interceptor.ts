import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth';
import { catchError, switchMap, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Don't intercept auth endpoints to avoid infinite loops
  if (req.url.includes('/api/auth/')) {
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next(req);
  }

  // Check if token is expiring soon and refresh it
  if (token && authService.isTokenExpiringSoon() && !req.url.includes('/refresh')) {
    return authService.refreshToken().pipe(
      switchMap(() => {
        const newToken = authService.getToken();
        if (newToken) {
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });
        }
        return next(req);
      }),
      catchError((error) => {
        // If refresh fails, proceed with original request
        if (token) {
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }
        return next(req);
      })
    );
  }

  // Normal request with token
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401 && !req.url.includes('/refresh')) {
        // Try to refresh token
        if (token && authService.isTokenExpiringSoon()) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = authService.getToken();
              if (newToken) {
                // Retry original request with new token
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(retryReq);
              }
              return throwError(() => error);
            }),
            catchError((refreshError) => {
              // If refresh also fails, logout user
              authService.logout().subscribe();
              return throwError(() => refreshError);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
