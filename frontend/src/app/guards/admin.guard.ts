import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/auth']);
      return of(false);
    }

    const user = this.authService.getCurrentUser();
    const credentialId = user?.id;

    if (!credentialId) {
      this.router.navigate(['/auth']);
      return of(false);
    }

    // ✅ Vérifier le rôle depuis UserService (source de vérité)
    return this.userService.getUserByCredentialId(credentialId).pipe(
      map((response: any) => {
        const role = response?.data?.role?.toString().toUpperCase();
        console.log('👤 Rôle depuis UserService:', role);

        if (role === 'ADMIN') {
          console.log('✅ AdminGuard : Accès autorisé');
          return true;
        } else {
          console.log('❌ AdminGuard : Accès refusé');
          this.router.navigate(['/student/dashboard']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/student/dashboard']);
        return of(false);
      })
    );
  }
}