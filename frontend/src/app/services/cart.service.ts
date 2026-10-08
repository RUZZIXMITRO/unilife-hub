import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse, Cart } from '../models/ecommerce.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:65203/api/cart';
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const userId = this.authService.getUserId();
    return new HttpHeaders({ 'X-User-Id': userId || '1' });
  }

  getCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(this.apiUrl, {
      headers: this.getHeaders()
    }).pipe(
      tap(res => {
        if (res.success) this.cartCount.next(res.data?.totalItems || 0);
      })
    );
  }

  addToCart(productId: string, quantity: number, productTitle?: string, productImageUrl?: string): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(
      `${this.apiUrl}/items`,
      { productId, quantity, productTitle, productImageUrl },
      { headers: this.getHeaders() }
    ).pipe(
      tap(res => {
        if (res.success) this.cartCount.next(res.data?.totalItems || 0);
      })
    );
  }

  updateCartItem(itemId: number, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http.put<ApiResponse<Cart>>(
      `${this.apiUrl}/items/${itemId}`,
      { quantity },
      { headers: this.getHeaders() }
    );
  }

  removeFromCart(itemId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.apiUrl}/items/${itemId}`,
      { headers: this.getHeaders() }
    );
  }

  clearCart(): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }
}