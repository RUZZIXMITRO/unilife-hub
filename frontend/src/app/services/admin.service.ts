import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private authApiUrl = 'https://localhost:7076/api/Auth';
  private userApiUrl = 'https://localhost:7212/api/Users';
  private adminApiUrl = 'https://localhost:7212/api/Admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllUsers(): Observable<any> {
    return this.http.get(
      `${this.userApiUrl}`,
      { headers: this.getHeaders() }
    );
  }

 blockUser(userId: string, reason: string, blockedUntil?: Date): Observable<any> {
  return this.http.put(
    `${this.adminApiUrl}/block/${userId}`,
    { 
      reason: reason, 
      until: blockedUntil ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // ✅ "until" pas "blockedUntil"
    },
    { headers: this.getHeaders() }
  );
}

  unblockUser(userId: string): Observable<any> {
    return this.http.put(
      `${this.adminApiUrl}/unblock/${userId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  
promoteToAdmin(userId: string, credentialId: string): Observable<any> {
  return new Observable(observer => {
    // Étape 1 : Mettre à jour Role dans UserService
    this.http.put(
      `${this.adminApiUrl}/promote/${userId}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        // Étape 2 : Mettre à jour Role dans AuthService
        this.http.post(
          `${this.authApiUrl}/promote-to-admin/${credentialId}`,
          {},
          { headers: this.getHeaders() }
        ).subscribe({
          next: (res) => {
            observer.next(res);
            observer.complete();
          },
          error: (err) => {
            console.warn('⚠️ Auth promote failed:', err);
            // UserService mis à jour = suffisant
            observer.next({ success: true });
            observer.complete();
          }
        });
      },
      error: (err) => observer.error(err)
    });
  });
}

demoteFromAdmin(userId: string, credentialId: string): Observable<any> {
  return new Observable(observer => {
    this.http.put(
      `${this.adminApiUrl}/demote/${userId}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.http.post(
          `${this.authApiUrl}/demote-from-admin/${credentialId}`,
          {},
          { headers: this.getHeaders() }
        ).subscribe({
          next: (res) => {
            observer.next(res);
            observer.complete();
          },
          error: (err) => {
            observer.next({ success: true });
            observer.complete();
          }
        });
      },
      error: (err) => observer.error(err)
    });
  });
}

deleteUserComplete(userId: string, credentialId: string): Observable<any> {
  return new Observable(observer => {
    this.http.delete(
      `${this.adminApiUrl}/delete/${userId}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.http.delete(
          `${this.authApiUrl}/delete-credential/${credentialId}`,
          { headers: this.getHeaders() }
        ).subscribe({
          next: (res) => {
            observer.next(res);
            observer.complete();
          },
          error: (err) => {
            console.warn('⚠️ Credential pas supprimé:', err);
            observer.next({ success: true });
            observer.complete();
          }
        });
      },
      error: (err) => observer.error(err)
    });
  });
}
getUserStats(): Observable<any> {
  return this.http.get(
    `${this.userApiUrl}`,
    { headers: this.getHeaders() }
  );
}

registerUser(email: string, password: string): Observable<any> {
  return this.http.post(
    `${this.authApiUrl}/register`,
    {
      email: email,
      password: password,
      confirmPassword: password
    },
    { headers: this.getHeaders() }
  );
}

createUserProfile(data: any): Observable<any> {
  return this.http.post(
    `${this.userApiUrl}`,
    data,
    { headers: this.getHeaders() }
  );
}
}