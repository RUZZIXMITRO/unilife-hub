import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoursService {

  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  private decodeTokenPayload(): any | null {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  private resolveUserId(): string {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId && storedUserId !== 'undefined' && storedUserId !== 'null') {
      return storedUserId;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const idFromUser = user?.id || user?.userId;
      if (idFromUser) return String(idFromUser);
    } catch (e) {}

    const payload = this.decodeTokenPayload();
    const idFromToken = payload?.sub || payload?.nameid;
    return idFromToken ? String(idFromToken) : '';
  }

  private getRoleFromToken(): string {
    try {
      const decoded = this.decodeTokenPayload();
      if (!decoded) return 'STUDENT';
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        || decoded['role'] || decoded['Role'] || 'STUDENT';
      return role.replace('ROLE_', '').toUpperCase();
    } catch (e) {
      return 'STUDENT';
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const userId = this.resolveUserId();
    const role = this.getRoleFromToken();

    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    if (userId) headers = headers.set('X-User-Id', userId);
    if (role) headers = headers.set('X-User-Role', role);
    return headers;
  }

  // ========== COURS ==========
  getAllCours(): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses`,
      { headers: this.getHeaders() });
  }

  searchCours(keyword: string, categoryId?: number): Observable<any> {
    let url = `${this.apiUrl}/courses/search?keyword=${keyword}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getMesCours(): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/my-courses`,
      { headers: this.getHeaders() });
  }

  uploadCours(formData: FormData): Observable<any> {
    const token = localStorage.getItem('access_token');
    const userId = this.resolveUserId();
    const role = this.getRoleFromToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    if (userId) headers = headers.set('X-User-Id', userId);
    if (role) headers = headers.set('X-User-Role', role);
    return this.http.post(`${this.apiUrl}/courses`, formData, { headers });
  }

  downloadCours(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const userId = this.resolveUserId();
    const role = this.getRoleFromToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    if (userId) headers = headers.set('X-User-Id', userId);
    if (role) headers = headers.set('X-User-Role', role);
    return this.http.get(`${this.apiUrl}/courses/${id}/download`, { headers });
  }

  modifierCours(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/courses/${id}`, data,
      { headers: this.getHeaders() });
  }

  supprimerMonCours(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${id}/my-course`,
      { headers: this.getHeaders() });
  }

  approuverCours(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/courses/${id}/approve`, {},
      { headers: this.getHeaders() });
  }

  supprimerCours(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${id}`,
      { headers: this.getHeaders() });
  }

  // ========== FORMATIONS ==========
  getAllFormations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/formations`,
      { headers: this.getHeaders() });
  }

  searchFormations(keyword?: string, level?: string,
                   language?: string, categoryId?: number): Observable<any> {
    let url = `${this.apiUrl}/formations/search?`;
    if (keyword) url += `keyword=${keyword}&`;
    if (level) url += `level=${level}&`;
    if (language) url += `language=${language}&`;
    if (categoryId) url += `categoryId=${categoryId}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  ajouterFormation(formation: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/formations`, formation,
      { headers: this.getHeaders() });
  }

  modifierFormation(id: number, formation: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/formations/${id}`, formation,
      { headers: this.getHeaders() });
  }

  supprimerFormation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/formations/${id}`,
      { headers: this.getHeaders() });
  }

  incrementerClics(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/formations/${id}/click`, {},
      { headers: this.getHeaders() });
  }

  // ========== CATEGORIES ==========
  getAllCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`,
      { headers: this.getHeaders() });
  }

  ajouterCategorie(categorie: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, categorie,
      { headers: this.getHeaders() });
  }

  supprimerCategorie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`,
      { headers: this.getHeaders() });
  }

  // ========== FAVORIS ==========
  getMesFavoris(): Observable<any> {
    const userId = this.resolveUserId();
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.http.get(`${this.apiUrl}/favorites${query}`,
      { headers: this.getHeaders() });
  }

  ajouterFavori(resourceId: number, type: string): Observable<any> {
    const userId = this.resolveUserId();
    const query = userId
      ? `?type=${encodeURIComponent(type)}&userId=${encodeURIComponent(userId)}`
      : `?type=${encodeURIComponent(type)}`;
    return this.http.post(`${this.apiUrl}/favorites/${resourceId}${query}`, {},
      { headers: this.getHeaders() });
  }

  retirerFavori(resourceId: number): Observable<any> {
    const userId = this.resolveUserId();
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.http.delete(`${this.apiUrl}/favorites/${resourceId}${query}`,
      { headers: this.getHeaders() });
  }

  // ========== LIKES & COMMENTAIRES ==========
  toggleLike(resourceId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/likes/${resourceId}`, {},
      { headers: this.getHeaders() });
  }

  getCommentaires(resourceId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/comments/resource/${resourceId}`,
      { headers: this.getHeaders() });
  }

  ajouterCommentaire(resourceId: number, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments/resource/${resourceId}`,
      { content }, { headers: this.getHeaders() });
  }

  // ========== ADMIN ==========
  getStatistiques(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/statistics`,
      { headers: this.getHeaders() });
  }

  getCoursEnAttente(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/courses/pending`,
      { headers: this.getHeaders() });
  }
}