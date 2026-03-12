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
    console.log('🔒 AdminGuard : Vérification du rôle...');

    const token = this.authService.getToken();
    if (!token) {
      console.log('❌ AdminGuard : Pas de token');
      this.router.navigate(['/auth']);
      return of(false);
    }

    const user = this.authService.getCurrentUser();
    const credentialId = user?.id;
    console.log('👤 CredentialId:', credentialId);

    if (!credentialId) {
      console.log('❌ AdminGuard : Pas de credentialId');
      this.router.navigate(['/auth']);
      return of(false);
    }

    return this.userService.getUserByCredentialId(credentialId).pipe(
      map((response: any) => {
        const role = response?.data?.role?.toString().toUpperCase();
        console.log('👤 Rôle depuis UserService:', role);

        if (role === 'ADMIN') {
          console.log('✅ AdminGuard : Accès autorisé (ADMIN)');
          return true;
        } else {
          console.log('❌ AdminGuard : Accès refusé, role =', role);
          this.router.navigate(['/student/dashboard']);
          return false;
        }
      }),
      catchError((error) => {
        console.error('❌ AdminGuard erreur:', error);

        const tokenUser = this.authService.getCurrentUser();
        const tokenRole = tokenUser?.role?.toString().toUpperCase();

        if (tokenRole === 'ADMIN') {
          console.log('⚠️ AdminGuard fallback token: ADMIN autorisé');
          return of(true);
        }

        this.router.navigate(['/student/dashboard']);
        return of(false);
      })
    );
  }
}