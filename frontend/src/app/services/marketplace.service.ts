import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {

  private apiUrl = 'http://192.168.137.130:8000/api/marketplace';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');
  
  let userRole = 'STUDENT';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] 
                 || payload.role 
                 || 'STUDENT';
    } catch (e) {}
  }

  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-Id': userId || '',
    'X-User-Role': userRole
  });
}

  getListings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/listings`);
  }

  getListing(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/listings/${id}`);
  }

  createListing(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/listings`, data, { headers: this.getHeaders() });
  }

  updateListing(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/listings/${id}`, data, { headers: this.getHeaders() });
  }

  deleteListing(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/listings/${id}`, { headers: this.getHeaders() });
  }

  getMyListings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/listings/my`, { headers: this.getHeaders() });
  }

  searchListings(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/listings/search?q=${query}`);
  }

  getListingsByCategory(category: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/listings/category/${category}`);
  }

  getMyFavorites(): Observable<any> {
    return this.http.get(`${this.apiUrl}/favorites`, { headers: this.getHeaders() });
  }

  addFavorite(listingId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/favorites/${listingId}`, {}, { headers: this.getHeaders() });
  }

  removeFavorite(listingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favorites/${listingId}`, { headers: this.getHeaders() });
  }

  contactSeller(listingId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact/${listingId}`, {}, { headers: this.getHeaders() });
  }

  reportListing(listingId: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/${listingId}`, { reason }, { headers: this.getHeaders() });
  }

  adminGetListings(status?: string): Observable<any> {
    const url = status ? `${this.apiUrl}/admin/listings?status=${status}` : `${this.apiUrl}/admin/listings`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  adminApproveListing(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/listings/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  adminRejectListing(id: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/listings/${id}/reject`, { reason }, { headers: this.getHeaders() });
  }

  adminDeleteListing(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/listings/${id}`, { headers: this.getHeaders() });
  }

  adminGetStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`, { headers: this.getHeaders() });
  }

  adminGetReports(): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/reports`, { headers: this.getHeaders() });
}

adminDeleteReport(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/admin/reports/${id}`, { headers: this.getHeaders() });
}
}