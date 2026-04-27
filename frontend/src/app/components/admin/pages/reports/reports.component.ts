import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Report {
  id: number;
  reporterId: number;
  reportedUserId: number;
  contentId: number;
  contentType: string;
  reason: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  reports: Report[] = [];
  filteredReports: Report[] = [];
  isLoading = false;
  activeFilter = 'ALL';

  stats = {
    total: 0,
    pending: 0,
    resolved: 0,
    dismissed: 0
  };

  private apiUrl = 'http://localhost:5000/api/social';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReports();
    this.loadStats();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  loadReports(): void {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/admin/reports`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.reports = res.data;
          this.applyFilter(this.activeFilter);
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadStats(): void {
    this.http.get<any>(`${this.apiUrl}/admin/reports/stats`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) this.stats = res.data;
      }
    });
  }

  applyFilter(filter: string): void {
    this.activeFilter = filter;
    if (filter === 'ALL') {
      this.filteredReports = this.reports;
    } else {
      this.filteredReports = this.reports.filter(r => r.status === filter);
    }
  }

  resolveReport(id: number): void {
    this.http.put<any>(`${this.apiUrl}/admin/reports/${id}/resolve`, {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.updateReportStatus(id, 'RESOLVED');
          this.loadStats();
        }
      }
    });
  }

  dismissReport(id: number): void {
    this.http.put<any>(`${this.apiUrl}/admin/reports/${id}/dismiss`, {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.updateReportStatus(id, 'DISMISSED');
          this.loadStats();
        }
      }
    });
  }

  deleteReport(id: number): void {
    if (!confirm('Supprimer ce signalement et son contenu ?')) return;
    this.http.delete<any>(`${this.apiUrl}/admin/reports/${id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.reports = this.reports.filter(r => r.id !== id);
          this.applyFilter(this.activeFilter);
          this.loadStats();
        }
      }
    });
  }

  private updateReportStatus(id: number, status: string): void {
    const report = this.reports.find(r => r.id === id);
    if (report) report.status = status;
    this.applyFilter(this.activeFilter);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'RESOLVED': return 'Traité';
      case 'DISMISSED': return 'Rejeté';
      default: return status;
    }
  }

  getContentTypeLabel(type: string): string {
    switch (type) {
      case 'POST': return 'Publication';
      case 'COMMENT': return 'Commentaire';
      case 'USER': return 'Utilisateur';
      default: return type;
    }
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return `Il y a ${Math.floor(diff / 86400)}j`;
  }
}