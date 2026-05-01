import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService } from '../../../../services/catalog.service';
import { CartService } from '../../../../services/cart.service';
import { FavoriteService } from '../../../../services/favorite.service';
import { ReviewService } from '../../../../services/review.service';
import { AuthService } from '../../../../services/auth.service';
import { Product, Review, ProductRating } from '../../../../models/ecommerce.models';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  reviews: Review[] = [];
  rating: ProductRating | null = null;
  loading = true;
  addingToCart = false;
  isFavorite = false;
  selectedImage = '';
  primaryImage = '';
  quantity = 1;
  successMessage = '';
  errorMessage = '';

  // Variantes
  selectedColor: any = null;
  selectedSize = '';

  // Review form
  showReviewForm = false;
  newReview = { rating: 5, comment: '' };
  submittingReview = false;
  hoverStar = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
      this.loadReviews(id);
      this.checkFavorite(id);
    }
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.catalogService.getProductById(id).subscribe({
      next: res => {
        if (res.success) {
          this.product = res.data;
          this.primaryImage = this.getPrimaryImage();
          this.selectedImage = this.primaryImage;
          const attrs = res.data.attributes;
          const colors = attrs?.['couleurs'] || [];
          const sizes = attrs?.['tailles'] || [];
          if (colors.length > 0) {
            this.selectedColor = colors[0];
            // Afficher image de la première couleur si disponible
            if (colors[0]?.imageUrl) {
              this.selectedImage = colors[0].imageUrl;
            }
          }
          if (sizes.length > 0) this.selectedSize = sizes[0];
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadReviews(productId: string): void {
    this.reviewService.getProductReviews(productId).subscribe({
      next: res => { if (res.success) this.reviews = res.data; }
    });
    this.reviewService.getProductRating(productId).subscribe({
      next: res => { if (res.success) this.rating = res.data; }
    });
  }

  checkFavorite(productId: string): void {
    this.favoriteService.isFavorite(productId).subscribe({
      next: res => { if (res.success) this.isFavorite = res.data; }
    });
  }

  onColorSelect(color: any): void {
    this.selectedColor = color;
    const imageUrl = typeof color === 'object' ? color.imageUrl : null;
    this.selectedImage = imageUrl || this.primaryImage;
  }

  getColorName(color: any): string {
    return typeof color === 'object' ? color.name : color;
  }

  getColorHex(color: any): string {
    return typeof color === 'object' ? color.hex : color;
  }

  isColorSelected(color: any): boolean {
    if (!this.selectedColor) return false;
    return this.getColorName(color) === this.getColorName(this.selectedColor);
  }

  addToCart(): void {
    if (!this.product) return;

    const colors = this.product.attributes?.['couleurs'] || [];
    const sizes = this.product.attributes?.['tailles'] || [];

    if (colors.length > 0 && !this.selectedColor) {
      this.errorMessage = 'Veuillez choisir une couleur';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (sizes.length > 0 && !this.selectedSize) {
      this.errorMessage = 'Veuillez choisir une taille';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.addingToCart = true;
this.cartService.addToCart(this.product.id, this.quantity, this.product.title, this.getPrimaryImage()).subscribe({
        next: res => {
        if (res.success) {
          let msg = 'Produit ajouté au panier !';
          if (this.selectedColor) msg += ` — ${this.getColorName(this.selectedColor)}`;
          if (this.selectedSize) msg += ` / ${this.selectedSize}`;
          this.successMessage = msg;
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.addingToCart = false;
      },
      error: () => this.addingToCart = false
    });
  }

  toggleFavorite(): void {
    if (!this.product) return;
    if (this.isFavorite) {
      this.favoriteService.removeFavorite(this.product.id).subscribe({
        next: () => this.isFavorite = false
      });
    } else {
      this.favoriteService.addFavorite(this.product.id).subscribe({
        next: () => this.isFavorite = true
      });
    }
  }

  submitReview(): void {
    if (!this.product || !this.newReview.comment.trim()) return;
    this.submittingReview = true;
    this.reviewService.createReview({
      productId: this.product.id,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).subscribe({
      next: res => {
        if (res.success) {
          this.successMessage = 'Avis soumis — en attente de modération !';
          this.showReviewForm = false;
          this.newReview = { rating: 5, comment: '' };
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.submittingReview = false;
      },
      error: () => this.submittingReview = false
    });
  }

  markHelpful(reviewId: string): void {
    this.reviewService.markHelpful(reviewId).subscribe({
      next: res => {
        if (res.success) {
          const review = this.reviews.find(r => r.id === reviewId);
          if (review) review.helpfulCount++;
        }
      }
    });
  }

  getPrimaryImage(): string {
    const primary = this.product?.images?.find(img => img.primary);
    return primary?.imageUrl || 'https://placehold.co/400x400?text=No+Image';
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getRatingPercent(star: number): number {
    if (!this.rating || this.rating.totalReviews === 0) return 0;
    return Math.round((this.rating.ratingDistribution[star] || 0) / this.rating.totalReviews * 100);
  }

  goBack(): void {
    this.router.navigate(['/student/ecommerce']);
  }

  goToCart(): void {
    this.router.navigate(['/student/ecommerce/cart']);
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  getProductColors(): any[] {
    return this.product?.attributes?.['couleurs'] || [];
  }

  getProductSizes(): string[] {
    return this.product?.attributes?.['tailles'] || [];
  }
}