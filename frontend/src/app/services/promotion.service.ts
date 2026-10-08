import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Promotion, ApplyPromoResponse } from '../models/ecommerce.models';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private apiUrl = 'http://localhost:56993/api/promotions';

  constructor(private http: HttpClient) {}

  getActivePromotions(): Observable<ApiResponse<Promotion[]>> {
    return this.http.get<ApiResponse<Promotion[]>>(`${this.apiUrl}/active`);
  }

  getAllPromotions(): Observable<ApiResponse<Promotion[]>> {
    return this.http.get<ApiResponse<Promotion[]>>(this.apiUrl);
  }

  createPromotion(promo: any): Observable<ApiResponse<Promotion>> {
    return this.http.post<ApiResponse<Promotion>>(this.apiUrl, promo);
  }

  applyPromoCode(code: string, cartAmount: number, userId: string): Observable<ApiResponse<ApplyPromoResponse>> {
    return this.http.post<ApiResponse<ApplyPromoResponse>>(
      `${this.apiUrl}/apply`,
      { code, cartAmount, userId }
    );
  }

  deactivatePromotion(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}