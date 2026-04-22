import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface UserProfile {
  credentialId: string;
  name: string;
  email: string;
  phone?: string;
  university?: string;
  studentId?: string;
  academicYear?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  university?: string;
  studentId?: string;
  academicYear?: string;
  bio?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  blockedUntil?: string;
  createdAt: string;
  lastLogin?: string;
  profile?: {
    dateOfBirth?: string;
    address?: string;
    city?: string;
    country?: string;
    age?: number;
  };
  preferences?: {
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:7212/api/Users';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUserByCredentialId(credentialId: string): Observable<ApiResponse<UserResponse>> {
    console.log('📤 GET by credentialId:', `${this.apiUrl}/by-credential/${credentialId}`);
    
    return this.http.get<ApiResponse<UserResponse>>(
      `${this.apiUrl}/by-credential/${credentialId}`,
      { headers: this.getHeaders() }
    );
  }

  getUserById(userId: string): Observable<ApiResponse<UserResponse>> {
    console.log('📤 GET by id:', `${this.apiUrl}/${userId}`);
    
    return this.http.get<ApiResponse<UserResponse>>(
      `${this.apiUrl}/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  createUserProfile(userData: UserProfile): Observable<ApiResponse<UserResponse>> {
    console.log('📤 POST:', this.apiUrl);
    console.log('📤 Data:', userData);
    
    return this.http.post<ApiResponse<UserResponse>>(
      this.apiUrl,
      userData,
      { headers: this.getHeaders() }
    );
  }

  updateUserProfile(userId: string, userData: any): Observable<ApiResponse<UserResponse>> {
    console.log('📤 PUT vers:', `${this.apiUrl}/${userId}`);
    console.log('📤 Data brute reçue:', userData);
    
    const formattedData: any = {
      name: userData.name || null,
      phone: userData.phone || null,
      university: userData.university || null,
      studentId: userData.studentId || null,
      academicYear: userData.academicYear || null,
      bio: userData.bio || null,
      address: userData.address || null,
      city: userData.city || null,
      country: userData.country || null
    };
    
    if (userData.dateOfBirth && userData.dateOfBirth.trim() !== '') {
      const date = new Date(userData.dateOfBirth);
      if (!isNaN(date.getTime())) {
        formattedData.dateOfBirth = date.toISOString();
      } else {
        formattedData.dateOfBirth = null;
      }
    } else {
      formattedData.dateOfBirth = null;
    }
    
    console.log('📤 Data formatée envoyée:', formattedData);
    
    return this.http.put<ApiResponse<UserResponse>>(
      `${this.apiUrl}/${userId}`,
      formattedData,
      { headers: this.getHeaders() }
    );
  }

  deleteUser(userId: string): Observable<ApiResponse<boolean>> {
    console.log('🗑️ Suppression utilisateur:', userId);
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.delete<ApiResponse<boolean>>(
      `${this.apiUrl}/${userId}`,
      { headers: headers }
    );
  }
  // Récupérer tous les utilisateurs (pour admin)
getAllUsers(): Observable<any> {
  const token = localStorage.getItem('access_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  return this.http.get(`${this.apiUrl}`, { headers });
}
}