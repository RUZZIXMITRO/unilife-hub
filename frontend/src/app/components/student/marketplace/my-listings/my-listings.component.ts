import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../../../services/marketplace.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-my-listings',
  templateUrl: './my-listings.component.html',
  styleUrls: ['./my-listings.component.css'],
})
export class MyListingsComponent implements OnInit {
  listings: any[] = [];
  loading = false;
  confirmDeleteId: number | null = null;

  constructor(
    private marketplaceService: MarketplaceService,
    private router: Router,
    private toast: ToastService
    
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.marketplaceService.getMyListings().subscribe({
      next: (data) => { this.listings = data.data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getStatusClass(status: string): string {
    if (status === 'approved') return 'status-approved';
    if (status === 'rejected') return 'status-rejected';
    return 'status-pending';
  }

  getStatusLabel(status: string): string {
    if (status === 'approved') return 'Approuvée';
    if (status === 'rejected') return 'Rejetée';
    return 'En attente';
  }

  getStatusIcon(status: string): string {
    if (status === 'approved') return '●';
    if (status === 'rejected') return '●';
    return '●';
  }

  confirmDelete(id: number): void {
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  delete(id: number): void {
    this.marketplaceService.deleteListing(id).subscribe({
      next: () => {
        this.listings = this.listings.filter(l => l.id !== id);
        this.confirmDeleteId = null;
        this.toast.success('Annonce supprimée');
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression');
        this.confirmDeleteId = null;
      }
    });
  }

  goToPublish(): void {
    this.router.navigate(['/student/marketplace/publish']);
  }

  goBack(): void {
    this.router.navigate(['/student/marketplace']);
  }
  activeTab = 'all';

setTab(tab: string): void {
  this.activeTab = tab;
}

getCount(status: string): number {
  return this.listings.filter(l => l.status === status).length;
}

getFiltered(): any[] {
  if (this.activeTab === 'all') return this.listings;
  return this.listings.filter(l => l.status === this.activeTab);
}
}