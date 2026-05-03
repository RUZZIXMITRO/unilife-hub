import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../../../services/review.service';
import { Review } from '../../../../models/ecommerce.models';
import { UserService } from '../../../../services/user.service';


@Component({
  selector: 'app-admin-reviews',
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.css']
})
export class AdminReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;
  processingId: string | null = null;
  userNames: { [key: string]: string } = {};
  successMessage = '';
  selectedFilter = 'Pending';

  filters = [
    { key: 'Pending',  label: 'En attente' },
    { key: 'Approved', label: 'Approuvés' },
    { key: 'Rejected', label: 'Rejetés' },
    { key: 'all',      label: 'Tous' }
  ];

constructor(
  private reviewService: ReviewService,
  private userService: UserService
) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewService.getPendingReviews().subscribe({
      next: res => {
        if (res.success) this.reviews = res.data;
        const userIds = [...new Set(res.data.map((r: Review) => r.userId))];
userIds.forEach(userId => {
  if (userId.includes('-')) {
    this.userService.getUserByCredentialId(userId).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.userNames[userId] = res.data.name || res.data.email;
        }
      },
      error: () => { this.userNames[userId] = userId.slice(0, 8) + '...'; }
    });
  }
});
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getUserName(userId: string): string {
  return this.userNames[userId] || userId.slice(0, 8) + '...';
}

getUserInitial(userId: string): string {
  const name = this.userNames[userId];
  return name ? name[0].toUpperCase() : userId[0].toUpperCase();
}

  approve(reviewId: string): void {
    this.processingId = reviewId;
    this.reviewService.approveReview(reviewId).subscribe({
      next: res => {
        if (res.success) {
          this.reviews = this.reviews.filter(r => r.id !== reviewId);
          this.successMessage = 'Avis approuvé !';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.processingId = null;
      },
      error: () => this.processingId = null
    });
  }

  reject(reviewId: string): void {
    this.processingId = reviewId;
    this.reviewService.rejectReview(reviewId).subscribe({
      next: res => {
        if (res.success) {
          this.reviews = this.reviews.filter(r => r.id !== reviewId);
          this.successMessage = 'Avis rejeté !';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.processingId = null;
      },
      error: () => this.processingId = null
    });
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  get filteredReviews(): Review[] {
    if (this.selectedFilter === 'all') return this.reviews;
    return this.reviews.filter(r => r.status === this.selectedFilter);
  }
}