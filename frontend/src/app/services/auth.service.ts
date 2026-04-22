import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
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
  private apiUrl = 'http://localhost:7076/api/Auth';
  
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
  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    console.log('🔑 Changement de mot de passe...');
    
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post(
      `${this.apiUrl}/change-password`,
      passwordData,
      { headers: headers }
    );
  }

  // ==================== LOGOUT ====================
  logout(): void {
    const token = this.getToken();
    
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => console.log('✅ Déconnexion réussie'),
        error: (error) => console.error('❌ Erreur lors de la déconnexion:', error)
      });
    }
    
    this.clearAuthData();
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  // ==================== PASSWORD RESET ====================
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-password-reset`, { email });
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
      confirmPassword
    });
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

  // ✅ MÉTHODE CORRIGÉE
  getCurrentUser(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Décoder le JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      console.log('🔍 JWT Payload complet:', payload);
      
      // Extraire les informations avec le chemin Microsoft du rôle
      return {
        id: payload.sub || payload.nameid,
        email: payload.email,
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || 'STUDENT'
      };
    } catch (error) {
      console.error('❌ Erreur décodage token:', error);
      return null;
    }
  }

  isProfileCompleted(): boolean {
    return localStorage.getItem('profile_completed') === 'true';
  }

  markProfileAsCompleted(): void {
    localStorage.setItem('profile_completed', 'true');
  }

  // ==================== DELETE ACCOUNT ====================
  deleteAccount(): Observable<any> {
    console.log('🗑️ Suppression du compte...');
    
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.delete(
      `${this.apiUrl}/delete-account`,
      { headers: headers }
    );
  }
}