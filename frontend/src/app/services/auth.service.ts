import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.models';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5000/api/Auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = this.getToken();
    const user = this.getUser();
    if (token && user) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(user);
    }
  }

  // ==================== LOGIN ====================
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.saveAuthData(response.data);
            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  // ==================== REGISTER ====================
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.saveAuthData(response.data);
            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  // ==================== CHANGE PASSWORD ====================
  // ✅ Suppression du header manuel (interceptor s'en charge)
  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, passwordData);
  }

  // ==================== LOGOUT ====================
  // ✅ Phase 3 : clearAuthData APRÈS la réponse (BUG #31)
  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => {
          this.clearAuthData();
          this.isAuthenticatedSubject.next(false);
          this.currentUserSubject.next(null);
          this.router.navigate(['/']);
        },
        error: () => {
          // Déconnexion locale même si le serveur échoue
          this.clearAuthData();
          this.isAuthenticatedSubject.next(false);
          this.currentUserSubject.next(null);
          this.router.navigate(['/']);
        }
      });
    } else {
      this.clearAuthData();
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
      this.router.navigate(['/']);
    }
  }

  // ==================== PASSWORD RESET ====================
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-password-reset`, { email });
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token, newPassword, confirmPassword
    });
  }

  // ==================== DELETE ACCOUNT ====================
  // ✅ Suppression du header manuel (interceptor s'en charge)
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-account`);
  }

  // ==================== HELPER METHODS ====================
  private saveAuthData(data: AuthResponse['data']): void {
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('user_id', data.user.id);
    localStorage.setItem('user_email', data.user.email);
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_profile_id');
    localStorage.removeItem('profile_completed');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUser(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  getUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ==================== Phase 1.2 : Méthodes centralisées ====================

  /**
   * Décode safely le JWT (gère base64url-safe).
   */
  private decodeToken(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  /**
   * ✅ Récupère l'UUID de l'utilisateur connecté depuis le JWT.
   */
  getCurrentUserId(): string | null {
    const payload = this.decodeToken();
    if (!payload) return null;
    return payload.sub
        || payload.nameid
        || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        || null;
  }

  /**
   * ✅ Récupère le rôle depuis le JWT.
   */
  getCurrentUserRole(): string {
    const payload = this.decodeToken();
    if (!payload) return 'STUDENT';
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        || payload.role
        || 'STUDENT';
  }

  /**
   * ✅ getCurrentUser() simplifié utilisant les helpers.
   */
  getCurrentUser(): { id: string | null; email: string | null; role: string } | null {
    const payload = this.decodeToken();
    if (!payload) return null;
    return {
      id: this.getCurrentUserId(),
      email: payload.email || null,
      role: this.getCurrentUserRole()
    };
  }

  isProfileCompleted(): boolean {
    return localStorage.getItem('profile_completed') === 'true';
  }

  markProfileAsCompleted(): void {
    localStorage.setItem('profile_completed', 'true');
  }
}