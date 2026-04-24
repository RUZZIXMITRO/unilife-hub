import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketplaceService } from '../../../../services/marketplace.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-marketplace-detail',
  templateUrl: './marketplace-detail.component.html',
  styleUrls: ['./marketplace-detail.component.css']
})
export class MarketplaceDetailComponent implements OnInit {
  listing: any = null;
  loading = false;
  contactInfo: any = null;
  showContact = false;
  showReportModal = false;
  reportReason = '';
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marketplaceService: MarketplaceService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadListing(+id);
  }

  loadListing(id: number): void {
    this.loading = true;
    this.marketplaceService.getListing(id).subscribe({
      next: (data) => {
        this.listing = data.data;
        this.loading = false;
        this.checkFavorite(id);
      },
      error: () => this.loading = false
    });
  }

  checkFavorite(listingId: number): void {
    this.marketplaceService.getMyFavorites().subscribe({
      next: (data) => {
        this.isFavorite = data.data.some((f: any) => f.listingId === listingId);
      }
    });
  }
getOptimizedImage(url: string): string {
  if (!url) return url;
  return url;
}
  contactSeller(): void {
    this.marketplaceService.contactSeller(this.listing.id).subscribe({
      next: (data) => {
        this.contactInfo = data.data;
        this.showContact = true;
        this.toast.success('Coordonnées du vendeur affichées !');
      },
      error: () => this.toast.error('Erreur lors du contact')
    });
  }

  toggleFavorite(): void {
    if (this.isFavorite) {
      this.marketplaceService.removeFavorite(this.listing.id).subscribe({
        next: () => {
          this.isFavorite = false;
          this.toast.warning('Retiré des favoris');
        },
        error: () => this.toast.error('Erreur')
      });
    } else {
      this.marketplaceService.addFavorite(this.listing.id).subscribe({
        next: () => {
          this.isFavorite = true;
          this.toast.success('Ajouté aux favoris !');
        },
        error: () => this.toast.error('Erreur')
      });
    }
  }

  submitReport(): void {
    if (!this.reportReason.trim()) {
      this.toast.warning('Décris le problème avant d\'envoyer');
      return;
    }
    this.marketplaceService.reportListing(this.listing.id, this.reportReason).subscribe({
      next: () => {
        this.showReportModal = false;
        this.reportReason = '';
        this.toast.success('Annonce signalée, merci !');
      },
      error: () => this.toast.error('Erreur lors du signalement')
    });
  }

  goBack(): void {
    this.router.navigate(['/student/marketplace']);
  }
  getConditionClass(condition: string): string {
  if (!condition) return 'cond-avg';
  if (condition === 'Neuf') return 'cond-new';
  if (condition === 'Très bon état') return 'cond-great';
  if (condition === 'Bon état') return 'cond-good';
  return 'cond-avg';
}

getCatIconFromCategory(cat: string): string {
  const icons: any = {
    'Livres & Cours': 'fa-book',
    'Informatique': 'fa-laptop',
    'Mobilier': 'fa-couch',
    'Sport': 'fa-futbol',
    'Autre': 'fa-box-open'
  };
  return icons[cat] || 'fa-tag';
}
}