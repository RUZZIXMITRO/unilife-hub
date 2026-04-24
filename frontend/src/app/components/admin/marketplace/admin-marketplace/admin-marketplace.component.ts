import { Component, OnInit } from '@angular/core';
import { MarketplaceService } from '../../../../services/marketplace.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-admin-marketplace',
  templateUrl: './admin-marketplace.component.html',
  styleUrls: ['./admin-marketplace.component.css']
})
export class AdminMarketplaceComponent implements OnInit {
  listings: any[] = [];
  loading = false;
  activeTab = 'pending';
  rejectModalId: number | null = null;
  rejectReason = '';

  constructor(
    private marketplaceService: MarketplaceService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadListings();
  }

 

  getFiltered(): any[] {
    return this.listings.filter(l => l.status === this.activeTab);
  }

  getCount(status: string): number {
    return this.listings.filter(l => l.status === status).length;
  }

  approve(id: number): void {
    this.marketplaceService.adminApproveListing(id).subscribe({
      next: () => {
        this.listings = this.listings.map(l =>
          l.id === id ? { ...l, status: 'approved' } : l
        );
        this.toast.success('Annonce approuvée !');
      },
      error: () => this.toast.error('Erreur lors de l\'approbation')
    });
  }

  openRejectModal(id: number): void {
    this.rejectModalId = id;
    this.rejectReason = '';
  }

  confirmReject(): void {
    if (!this.rejectReason.trim()) {
      this.toast.warning('Indique une raison de rejet');
      return;
    }
    this.marketplaceService.adminRejectListing(this.rejectModalId!, this.rejectReason).subscribe({
      next: () => {
        this.listings = this.listings.map(l =>
          l.id === this.rejectModalId ? { ...l, status: 'rejected', rejectionReason: this.rejectReason } : l
        );
        this.rejectModalId = null;
        this.toast.warning('Annonce rejetée');
      },
      error: () => this.toast.error('Erreur lors du rejet')
    });
  }

  deleteListing(id: number): void {
    this.marketplaceService.adminDeleteListing(id).subscribe({
      next: () => {
        this.listings = this.listings.filter(l => l.id !== id);
        this.toast.success('Annonce supprimée');
      },
      error: () => this.toast.error('Erreur lors de la suppression')
    });
  }

  getConditionClass(condition: string): string {
    if (!condition) return 'cond-avg';
    if (condition === 'Neuf') return 'cond-new';
    if (condition === 'Très bon état') return 'cond-great';
    if (condition === 'Bon état') return 'cond-good';
    return 'cond-avg';
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
loadListings(): void {
  this.loading = true;
  this.marketplaceService.adminGetListings().subscribe({
    next: (data) => {
      this.listings = data.data;
      console.log('listings:', this.listings);
      console.log('imageUrls exemple:', this.listings[0]?.imageUrls);
      this.loading = false;
    },
    error: () => this.loading = false
  });
}
}