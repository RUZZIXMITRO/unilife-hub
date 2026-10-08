import { Component, OnInit } from '@angular/core';
import { MarketplaceService } from '../../../../services/marketplace.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {
  reports: any[] = [];
  loading = false;
  confirmDeleteId: number | null = null;
  confirmDeleteListingId: number | null = null;

  constructor(
    private marketplaceService: MarketplaceService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }



  deleteReport(id: number): void {
    this.marketplaceService.adminDeleteReport(id).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r.id !== id);
        this.confirmDeleteId = null;
        this.toast.success('Signalement supprimé');
      },
      error: () => this.toast.error('Erreur lors de la suppression')
    });
  }

  deleteListingFromReport(report: any): void {
    this.marketplaceService.adminDeleteListing(report.listingId).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r.listingId !== report.listingId);
        this.confirmDeleteListingId = null;
        this.toast.success('Annonce supprimée et signalements retirés');
      },
      error: () => this.toast.error('Erreur lors de la suppression')
    });
  }
 getImage(imageUrls: any): string | null {
  if (!imageUrls) return null;
  if (Array.isArray(imageUrls) && imageUrls.length > 0) return imageUrls[0];
  if (typeof imageUrls === 'string') {
    try {
      const parsed = JSON.parse(imageUrls);
      return parsed[0] || null;
    } catch { return null; }
  }
  return null;
}
loadReports(): void {
  this.loading = true;
  this.marketplaceService.adminGetReports().subscribe({
    next: (data) => {
      this.reports = data.data;
      console.log('reports:', this.reports);
      console.log('listing exemple:', this.reports[0]?.listing);
      console.log('imageUrls exemple:', this.reports[0]?.listing?.imageUrls);
      this.loading = false;
    },
    error: () => this.loading = false
  });
}
}