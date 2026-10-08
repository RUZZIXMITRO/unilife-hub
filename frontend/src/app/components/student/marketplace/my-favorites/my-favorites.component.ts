import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../../../services/marketplace.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-my-favorites',
  templateUrl: './my-favorites.component.html',
  styleUrls: ['./my-favorites.component.css']
})
export class MyFavoritesComponent implements OnInit {
  favorites: any[] = [];
  loading = false;

  constructor(
    private marketplaceService: MarketplaceService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.marketplaceService.getMyFavorites().subscribe({
      next: (data) => {
        const favs = data.data;
        if (favs.length === 0) {
          this.favorites = [];
          this.loading = false;
          return;
        }
        // Charger les détails de chaque annonce
        let loaded = 0;
        favs.forEach((fav: any) => {
          this.marketplaceService.getListing(fav.listingId).subscribe({
            next: (listing) => {
              this.favorites.push({
                ...fav,
                listing: listing.data
              });
              loaded++;
              if (loaded === favs.length) this.loading = false;
            },
            error: () => {
              loaded++;
              if (loaded === favs.length) this.loading = false;
            }
          });
        });
      },
      error: () => this.loading = false
    });
  }

  remove(listingId: number): void {
    this.marketplaceService.removeFavorite(listingId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.listingId !== listingId);
        this.toast.warning('Retiré des favoris');
      },
      error: () => this.toast.error('Erreur')
    });
  }

  goToDetail(listingId: number): void {
    this.router.navigate(['/student/marketplace', listingId]);
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
}