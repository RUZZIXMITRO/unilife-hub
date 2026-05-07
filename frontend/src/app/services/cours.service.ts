import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CoursService {

private apiUrl = 'http://localhost:8081/api';
  constructor(private http: HttpClient) {}

 private getHeaders(): HttpHeaders {
  const token = localStorage.getItem('access_token');
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
}

private getHeadersWithUserId(): HttpHeaders {
  const token = localStorage.getItem('access_token');
  const sub = token ? JSON.parse(atob(token.split('.')[1]))?.sub : '';
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-User-Id': sub || ''
  });
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
  const token = localStorage.getItem('access_token');  // ← aussi ici
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.post(`${this.apiUrl}/courses`, formData, { headers });
}

  downloadCours(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/${id}/download`,
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
  return this.http.get(`${this.apiUrl}/favorites`,
    { headers: this.getHeadersWithUserId() });
}

ajouterFavori(resourceId: number, type: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/favorites/${resourceId}?type=${type}`, {},
    { headers: this.getHeadersWithUserId() });
}

retirerFavori(resourceId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/favorites/${resourceId}`,
    { headers: this.getHeadersWithUserId() });
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
  getCoursDetail(id: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/courses/${id}`, { headers: this.getHeaders() });
}
}