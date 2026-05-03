import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Product, Category } from '../models/ecommerce.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private apiUrl = 'http://localhost:8081/api/catalog';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`);
  }

  getProductById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`);
  }

  searchProducts(keyword: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products/search?keyword=${keyword}`);
  }

  getProductsByCategory(categoryId: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products/category/${categoryId}`);
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/categories`);
  }

  createProduct(product: any): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: string, product: any): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/products/${id}`);
  }

  createCategory(category: any): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.apiUrl}/categories`, category);
  }
  updateCategory(id: string, data: any): Observable<ApiResponse<Category>> {
  return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/categories/${id}`, data);
}

deleteCategory(id: string): Observable<ApiResponse<void>> {
  return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/categories/${id}`);
}
}