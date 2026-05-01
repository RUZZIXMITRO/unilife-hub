import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Review, ProductRating } from '../models/ecommerce.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = 'http://localhost:8084/api/reviews';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const userId = this.authService.getUserId();
    return new HttpHeaders({ 'X-User-Id': userId || '1' });
  }

  getProductReviews(productId: string): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.apiUrl}/product/${productId}`);
  }

  getProductRating(productId: string): Observable<ApiResponse<ProductRating>> {
    return this.http.get<ApiResponse<ProductRating>>(`${this.apiUrl}/product/${productId}/rating`);
  }

  getMyReviews(): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.apiUrl}/my-reviews`, {
      headers: this.getHeaders()
    });
  }

  getPendingReviews(): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.apiUrl}/pending`);
  }

  createReview(review: any): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(this.apiUrl, review, {
      headers: this.getHeaders()
    });
  }

  approveReview(reviewId: string): Observable<ApiResponse<Review>> {
    return this.http.put<ApiResponse<Review>>(`${this.apiUrl}/${reviewId}/approve`, {});
  }

  rejectReview(reviewId: string): Observable<ApiResponse<Review>> {
    return this.http.put<ApiResponse<Review>>(`${this.apiUrl}/${reviewId}/reject`, {});
  }

  markHelpful(reviewId: string): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.apiUrl}/${reviewId}/helpful`, {});
  }
}