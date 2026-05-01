import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogService } from '../../../../services/catalog.service';
import { CartService } from '../../../../services/cart.service';
import { FavoriteService } from '../../../../services/favorite.service';
import { Product, Category } from '../../../../models/ecommerce.models';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string = 'all';
  searchKeyword: string = '';
  loading: boolean = true;
  addingToCart: string | null = null;
  favoriteIds: Set<string> = new Set();
  successMessage: string = '';

  constructor(
    private catalogService: CatalogService,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadFavorites();
  }

  loadProducts(): void {
    this.loading = true;
    this.catalogService.getProducts().subscribe({
      next: res => {
        if (res.success) {
          this.products = res.data;
          this.filteredProducts = res.data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadCategories(): void {
    this.catalogService.getCategories().subscribe({
      next: res => {
        if (res.success) this.categories = res.data;
      }
    });
  }

  loadFavorites(): void {
    this.favoriteService.getFavorites().subscribe({
      next: res => {
        if (res.success) {
          this.favoriteIds = new Set(res.data.map(f => f.productId));
        }
      }
    });
  }

  filterByCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  onSearch(): void {
    if (this.searchKeyword.trim().length > 2) {
      this.catalogService.searchProducts(this.searchKeyword).subscribe({
        next: res => {
          if (res.success) this.filteredProducts = res.data;
        }
      });
    } else if (this.searchKeyword.trim().length === 0) {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    if (this.selectedCategory === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(
        p => p.categoryId === this.selectedCategory
      );
    }
  }

  addToCart(product: Product): void {
    this.addingToCart = product.id;
    this.cartService.addToCart(product.id, 1, product.title, this.getPrimaryImage(product)).subscribe({
      next: res => {
        if (res.success) {
          this.successMessage = `"${product.title}" ajouté au panier !`;
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.addingToCart = null;
      },
      error: () => this.addingToCart = null
    });
  }

  toggleFavorite(product: Product): void {
    if (this.favoriteIds.has(product.id)) {
      this.favoriteService.removeFavorite(product.id).subscribe({
        next: () => this.favoriteIds.delete(product.id)
      });
    } else {
      this.favoriteService.addFavorite(product.id).subscribe({
        next: () => this.favoriteIds.add(product.id)
      });
    }
  }

  goToDetail(productId: string): void {
    this.router.navigate(['/student/ecommerce/product', productId]);
  }

  isFavorite(productId: string): boolean {
    return this.favoriteIds.has(productId);
  }

  getPrimaryImage(product: Product): string {
    const primary = product.images?.find(img => img.primary);
    return primary?.imageUrl || 'https://placehold.co/400x400?text=no+image';
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
}