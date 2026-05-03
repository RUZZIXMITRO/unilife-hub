import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaymentIntent } from '../models/ecommerce.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
 private apiUrl = 'http://localhost:52437/api/payment';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const userId = this.authService.getUserId();
    return new HttpHeaders({ 'X-User-Id': userId || '1' });
  }

  createPaymentIntent(orderId: number, amount: number): Observable<ApiResponse<PaymentIntent>> {
    return this.http.post<ApiResponse<PaymentIntent>>(
      `${this.apiUrl}/create-intent`,
      { orderId, amount, currency: 'eur' },
      { headers: this.getHeaders() }
    );
  }

  confirmPayment(paymentIntentId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/confirm`,
      { paymentIntentId },
      { headers: this.getHeaders() }
    );
  }

  getMyPayments(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/my-payments`,
      { headers: this.getHeaders() }
    );
  }
}