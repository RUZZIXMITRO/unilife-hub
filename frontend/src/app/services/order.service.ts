import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Order, CreateOrderRequest } from '../models/ecommerce.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'https://localhost:59347/api/orders';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const userId = this.authService.getUserId();
    return new HttpHeaders({ 'X-User-Id': userId || '1' });
  }

  createOrder(request: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, request, {
      headers: this.getHeaders()
    });
  }

  getMyOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/my-orders`, {
      headers: this.getHeaders()
    });
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getAllOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  confirmPayment(orderId: number, paymentIntentId: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${orderId}/confirm-payment?paymentIntentId=${paymentIntentId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

 updateOrderStatus(orderId: number, status: number, comment?: string, trackingNumber?: string): Observable<ApiResponse<Order>> {
  const headers = new HttpHeaders({ 
    'X-User-Id': 'admin',
    'Content-Type': 'application/json'
  });
  return this.http.put<ApiResponse<Order>>(
    `${this.apiUrl}/${orderId}/status`,
    { 
      status: Number(status),
      comment: comment || null,
      trackingNumber: trackingNumber || null
    },
    { headers }
  );
}

  cancelOrder(orderId: number): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${orderId}/cancel`,
      {},
      { headers: this.getHeaders() }
    );
  }
}