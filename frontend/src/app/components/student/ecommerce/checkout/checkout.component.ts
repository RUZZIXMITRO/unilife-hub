import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../../services/order.service';
import { PaymentService } from '../../../../services/payment.service';
import { CartService } from '../../../../services/cart.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  step = 1; // 1: Livraison, 2: Paiement, 3: Confirmation
  loading = false;
  errorMessage = '';

  // State from cart
  totalAmount = 0;
  promoCode = '';
  discountAmount = 0;
  finalAmount = 0;

  // Order form
  shippingForm = {
    shippingAddress: '',
    shippingCity: '',
    shippingPhone: '',
    notes: ''
  };

  // Created order
  createdOrderId: number | null = null;
  paymentIntent: any = null;
  paymentConfirmed = false;

  // Card simulation
  cardNumber = '';
  cardExpiry = '';
  cardCvc = '';
  processingPayment = false;

 constructor(
  private orderService: OrderService,
  private paymentService: PaymentService,
  private cartService: CartService,
  public router: Router  // ← public
) {}

  ngOnInit(): void {
    const state = history.state;
    this.totalAmount = state?.totalAmount || 0;
    this.promoCode = state?.promoCode || '';
    this.discountAmount = state?.discountAmount || 0;
    this.finalAmount = state?.finalAmount || state?.totalAmount || 0;

    if (this.totalAmount === 0) {
      this.router.navigate(['/student/ecommerce/cart']);
    }
  }

  nextStep(): void {
    if (this.step === 1 && !this.validateShipping()) return;
    this.step++;
    if (this.step === 2) this.createOrder();
  }

  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  validateShipping(): boolean {
    if (!this.shippingForm.shippingAddress.trim()) {
      this.errorMessage = 'L\'adresse de livraison est obligatoire';
      return false;
    }
    if (!this.shippingForm.shippingPhone.trim()) {
      this.errorMessage = 'Le numéro de téléphone est obligatoire';
      return false;
    }
    this.errorMessage = '';
    return true;
  }

  createOrder(): void {
    this.loading = true;
    const request: any = {
      shippingAddress: this.shippingForm.shippingAddress,
      shippingCity: this.shippingForm.shippingCity,
      shippingPhone: this.shippingForm.shippingPhone,
      notes: this.shippingForm.notes
    };
    if (this.promoCode) request.promoCode = this.promoCode;

    this.orderService.createOrder(request).subscribe({
      next: res => {
        if (res.success) {
          this.createdOrderId = res.data.id;
          this.createPaymentIntent();
        } else {
          this.errorMessage = res.message;
          this.loading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la création de la commande';
        this.loading = false;
      }
    });
  }

  createPaymentIntent(): void {
    if (!this.createdOrderId) return;
    this.paymentService.createPaymentIntent(
      this.createdOrderId,
      this.finalAmount || this.totalAmount
    ).subscribe({
      next: res => {
        if (res.success) {
          this.paymentIntent = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'initialisation du paiement';
        this.loading = false;
      }
    });
  }

  processPayment(): void {
    if (!this.cardNumber || !this.cardExpiry || !this.cardCvc) {
      this.errorMessage = 'Veuillez remplir tous les champs de paiement';
      return;
    }

    this.processingPayment = true;
    this.errorMessage = '';

    // Confirmer le paiement via PaymentService
    this.paymentService.confirmPayment(this.paymentIntent.paymentIntentId).subscribe({
      next: () => {
        // Confirmer la commande via OrderService
        this.orderService.confirmPayment(
          this.createdOrderId!,
          this.paymentIntent.paymentIntentId
        ).subscribe({
          next: res => {
            if (res.success) {
              this.paymentConfirmed = true;
              this.step = 3;
            }
            this.processingPayment = false;
          },
          error: () => {
            this.errorMessage = 'Erreur lors de la confirmation';
            this.processingPayment = false;
          }
        });
      },
      error: () => {
        this.errorMessage = 'Paiement refusé — vérifiez vos informations';
        this.processingPayment = false;
      }
    });
  }

  goToOrders(): void {
    this.router.navigate(['/student/ecommerce/orders']);
  }

  goToShop(): void {
    this.router.navigate(['/student/ecommerce']);
  }

  formatCard(event: any): void {
    let val = event.target.value.replace(/\D/g, '');
    val = val.match(/.{1,4}/g)?.join(' ') || val;
    this.cardNumber = val.substring(0, 19);
  }

  formatExpiry(event: any): void {
    let val = event.target.value.replace(/\D/g, '');
    if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
    this.cardExpiry = val.substring(0, 5);
  }
}