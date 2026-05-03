import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../../../services/marketplace.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-marketplace-list',
  templateUrl: './marketplace-list.component.html',
  styleUrls: ['./marketplace-list.component.css']
})
export class MarketplaceListComponent implements OnInit {
  listings: any[] = [];
  filteredListings: any[] = [];
  favoriteIds: Set<number> = new Set();
  searchQuery = '';
  selectedCategory = '';
  loading = false;

  categories = ['Livres & Cours', 'Informatique', 'Mobilier', 'Sport', 'Autre'];


  constructor(
    private marketplaceService: MarketplaceService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadListings();
    this.loadFavorites();
  }

  loadListings(): void {
    this.loading = true;
    this.marketplaceService.getListings().subscribe({
      next: (data) => {
        this.listings = data;
        this.filteredListings = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadFavorites(): void {
    this.marketplaceService.getMyFavorites().subscribe({
      next: (data) => {
        this.favoriteIds = new Set(data.data.map((f: any) => f.listingId));
      }
    });
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.marketplaceService.searchListings(this.searchQuery).subscribe({
        next: (data) => this.filteredListings = data.data
      });
    } else {
      this.filteredListings = this.listings;
    }
  }

  filterByCategory(cat: string): void {
    this.selectedCategory = cat;
    if (cat) {
      this.marketplaceService.getListingsByCategory(cat).subscribe({
        next: (data) => this.filteredListings = data.data
      });
    } else {
      this.filteredListings = this.listings;
    }
  }

  goToDetail(id: number): void {
    this.router.navigate(['/student/marketplace', id]);
  }

  goToPublish(): void {
    this.router.navigate(['/student/marketplace/publish']);
  }

  toggleFavorite(event: Event, listingId: number): void {
    event.stopPropagation();
    if (this.favoriteIds.has(listingId)) {
      this.marketplaceService.removeFavorite(listingId).subscribe({
        next: () => {
          this.favoriteIds.delete(listingId);
          this.toast.warning('Retiré des favoris');
        },
        error: () => this.toast.error('Erreur lors de la suppression')
      });
    } else {
      this.marketplaceService.addFavorite(listingId).subscribe({
        next: () => {
          this.favoriteIds.add(listingId);
          this.toast.success('Ajouté aux favoris !');
        },
        error: () => this.toast.error('Erreur lors de l\'ajout')
      });
    }
  }

  isFavorite(listingId: number): boolean {
    return this.favoriteIds.has(listingId);
  }

  getOptimizedImage(url: string): string {
    if (!url) return '';
    return url.replace('/upload/', '/upload/w_400,q_auto,f_auto/');
  }

 getCatIcon(cat: string): string {
  const icons: any = {
    'Livres & Cours': 'fa-book',
    'Informatique': 'fa-laptop',
    'Mobilier': 'fa-couch',
    'Sport': 'fa-futbol',
    'Autre': 'fa-box-open'
  };
  return icons[cat] || 'fa-tag';
}

getConditionClass(condition: string): string {
  if (!condition) return 'cond-avg';
  if (condition === 'Neuf') return 'cond-new';
  if (condition === 'Très bon état') return 'cond-great';
  if (condition === 'Bon état') return 'cond-good';
  return 'cond-avg';
}
}