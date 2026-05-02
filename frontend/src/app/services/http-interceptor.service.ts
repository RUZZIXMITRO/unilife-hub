import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  private decodeTokenPayload(token: string): any | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('access_token');

    if (token) {
      const payload = this.decodeTokenPayload(token);
      const userId = payload?.sub || payload?.nameid || localStorage.getItem('user_id') || '';
      const role =
        payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload?.role ||
        'STUDENT';

      const cleanRole = String(role).replace('ROLE_', '').toUpperCase();
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          ...(userId ? { 'X-User-Id': String(userId) } : {}),
          ...(cleanRole ? { 'X-User-Role': cleanRole } : {})
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.clear();
          this.router.navigate(['/auth']);
        }
        return throwError(() => error);
      })
    );
  }
}