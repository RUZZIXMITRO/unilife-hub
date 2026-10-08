import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Favorite } from '../models/ecommerce.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private apiUrl = 'http://localhost:8083/api/favorites';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const userId = this.authService.getUserId();
    return new HttpHeaders({ 'X-User-Id': userId || '1' });
  }

  getFavorites(): Observable<ApiResponse<Favorite[]>> {
    return this.http.get<ApiResponse<Favorite[]>>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  addFavorite(productId: string): Observable<ApiResponse<Favorite>> {
    return this.http.post<ApiResponse<Favorite>>(
      this.apiUrl,
      { productId },
      { headers: this.getHeaders() }
    );
  }

  removeFavorite(productId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.apiUrl}/${productId}`,
      { headers: this.getHeaders() }
    );
  }

  isFavorite(productId: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/${productId}/check`,
      { headers: this.getHeaders() }
    );
  }
}