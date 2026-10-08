import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.getCurrentUser();

    console.log('🔒 AuthGuard - État:', { 
      isLoggedIn, 
      user, 
      url: state.url 
    });

    // 1. Si pas connecté → Login
    if (!isLoggedIn) {
      console.log('❌ Pas connecté, redirection vers /auth');
      this.router.navigate(['/auth']);
      return false;
    }

    // 2. ✅ SI ADMIN → Autoriser l'accès SANS vérifier le profil
    if (user?.role === 'ADMIN') {
      console.log('✅ AuthGuard : Utilisateur ADMIN, accès autorisé à', state.url);
      return true;
    }

    // 3. SI STUDENT → Vérifier le profil
    const isProfileCompleted = this.authService.isProfileCompleted();

    if (!isProfileCompleted) {
      // Si l'utilisateur essaie d'aller ailleurs que complete-profile
      if (state.url !== '/complete-profile') {
        console.log('⚠️ Profil incomplet, redirection vers /complete-profile');
        this.router.navigate(['/complete-profile']);
        return false;
      }
      // Autoriser l'accès à complete-profile
      console.log('✅ Accès autorisé à /complete-profile');
      return true;
    }

    // 4. Si connecté ET profil complété
    // Empêcher le retour sur complete-profile
    if (state.url === '/complete-profile') {
      console.log('✅ Profil déjà complété, redirection vers /student/dashboard');
      this.router.navigate(['/student/dashboard']);
      return false;
    }

    // Autoriser l'accès aux autres routes
    console.log('✅ Accès autorisé à', state.url);
    return true;
  }
}