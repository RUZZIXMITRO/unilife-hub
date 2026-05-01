import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../../services/cart.service';
import { PromotionService } from '../../../../services/promotion.service';
import { Cart, ApplyPromoResponse } from '../../../../models/ecommerce.models';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  promoCode = '';
  promoResult: ApplyPromoResponse | null = null;
  promoError = '';
  applyingPromo = false;
  updatingItem: number | null = null;
  removingItem: number | null = null;

  constructor(
    private cartService: CartService,
    private promotionService: PromotionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }
loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: res => {
        if (res.success) {
          console.log(res.data);  // ← ajoute ça
          this.cart = res.data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) return;
    this.updatingItem = itemId;
    this.cartService.updateCartItem(itemId, quantity).subscribe({
      next: res => {
        if (res.success) this.cart = res.data;
        this.updatingItem = null;
      },
      error: () => this.updatingItem = null
    });
  }

  removeItem(itemId: number): void {
    this.removingItem = itemId;
    this.cartService.removeFromCart(itemId).subscribe({
      next: res => {
        if (res.success) this.loadCart();
        this.removingItem = null;
      },
      error: () => this.removingItem = null
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => this.loadCart()
    });
  }

  applyPromo(): void {
    if (!this.promoCode.trim()) return;
    this.applyingPromo = true;
    this.promoError = '';
    this.promoResult = null;

    const total = this.cart?.totalAmount || 0;
    this.promotionService.applyPromoCode(this.promoCode, total, '1').subscribe({
      next: res => {
        if (res.success) {
          this.promoResult = res.data;
        } else {
          this.promoError = res.message;
        }
        this.applyingPromo = false;
      },
      error: () => {
        this.promoError = 'Code promo invalide';
        this.applyingPromo = false;
      }
    });
  }

  removePromo(): void {
    this.promoResult = null;
    this.promoCode = '';
    this.promoError = '';
  }

  getFinalAmount(): number {
    if (this.promoResult) return this.promoResult.finalAmount;
    return this.cart?.totalAmount || 0;
  }

  goToCheckout(): void {
    const state: any = { totalAmount: this.cart?.totalAmount };
    if (this.promoResult) {
      state.promoCode = this.promoCode;
      state.discountAmount = this.promoResult.discountAmount;
      state.finalAmount = this.promoResult.finalAmount;
    }
    this.router.navigate(['/student/ecommerce/checkout'], { state });
  }

  continueShopping(): void {
    this.router.navigate(['/student/ecommerce']);
  }
}