import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReviewService } from '../../../../services/review.service';
import { Review } from '../../../../models/ecommerce.models';

@Component({
  selector: 'app-my-reviews',
  templateUrl: './my-reviews.component.html',
  styleUrls: ['./my-reviews.component.css']
})
export class MyReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;

  constructor(
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewService.getMyReviews().subscribe({
      next: res => {
        if (res.success) this.reviews = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getStatusClass(status: string): string {
    const map: any = {
      'Pending':  'status-pending',
      'Approved': 'status-approved',
      'Rejected': 'status-rejected'
    };
    return map[status] || 'status-pending';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'Pending':  'En attente',
      'Approved': 'Approuvé',
      'Rejected': 'Rejeté'
    };
    return map[status] || status;
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/student/ecommerce/product', productId]);
  }

  goToShop(): void {
    this.router.navigate(['/student/ecommerce']);
  }
}