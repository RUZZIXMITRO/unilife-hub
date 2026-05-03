import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FavoriteService } from '../../../../services/favorite.service';
import { CartService } from '../../../../services/cart.service';
import { Favorite } from '../../../../models/ecommerce.models';

@Component({
  selector: 'app-my-favorites-ecommerce',
  templateUrl: './my-favorites.component.html',
  styleUrls: ['./my-favorites.component.css']
})
export class MyFavoritesComponent implements OnInit {
  favorites: Favorite[] = [];
  loading = true;
  removingId: string | null = null;
  addingToCartId: string | null = null;
  successMessage = '';

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.favoriteService.getFavorites().subscribe({
      next: res => {
        if (res.success) this.favorites = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  removeFavorite(productId: string): void {
    this.removingId = productId;
    this.favoriteService.removeFavorite(productId).subscribe({
      next: res => {
        if (res.success) {
          this.favorites = this.favorites.filter(f => f.productId !== productId);
        }
        this.removingId = null;
      },
      error: () => this.removingId = null
    });
  }

  addToCart(favorite: Favorite): void {
    this.addingToCartId = favorite.productId;
    this.cartService.addToCart(favorite.productId, 1).subscribe({
      next: res => {
        if (res.success) {
          this.successMessage = `"${favorite.productTitle}" ajouté au panier !`;
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.addingToCartId = null;
      },
      error: () => this.addingToCartId = null
    });
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/student/ecommerce/product', productId]);
  }

  goToShop(): void {
    this.router.navigate(['/student/ecommerce']);
  }
}