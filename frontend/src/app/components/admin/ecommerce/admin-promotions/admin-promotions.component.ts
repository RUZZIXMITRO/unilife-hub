import { Component, OnInit } from '@angular/core';
import { PromotionService } from '../../../../services/promotion.service';
import { Promotion } from '../../../../models/ecommerce.models';

@Component({
  selector: 'app-admin-promotions',
  templateUrl: './admin-promotions.component.html',
  styleUrls: ['./admin-promotions.component.css']
})
export class AdminPromotionsComponent implements OnInit {
  promotions: Promotion[] = [];
  loading = true;
  showForm = false;
  savingPromo = false;
  deletingId: number | null = null;
  successMessage = '';
  errorMessage = '';

  form = {
    code: '',
    description: '',
    discountType: 0,  // ← CORRIGÉ : 0 = Percentage, 1 = Fixed
    discountValue: 10,
    minAmount: 0,
    maxDiscount: 0,
    validFrom: '',
    validTo: '',
    maxUses: 100,
    maxUsesPerUser: 1,
    isActive: true
  };

  constructor(private promotionService: PromotionService) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.loading = true;
    this.promotionService.getAllPromotions().subscribe({
      next: res => {
        if (res.success) this.promotions = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openForm(): void {
    const today = new Date().toISOString().split('T')[0];  // "2026-04-30"
    this.form = {
      code: '', description: '',
      discountType: 0, discountValue: 10,
      minAmount: 0, maxDiscount: 0,
      validFrom: today,
      validTo: today,
      maxUses: 100, maxUsesPerUser: 1, isActive: true
    };
    this.errorMessage = '';
    this.showForm = true;
  }

  savePromotion(): void {
  if (!this.form.code || !this.form.validFrom || !this.form.validTo) {
    this.errorMessage = 'Code, dates de validité obligatoires';
    return;
  }
  this.savingPromo = true;

  const payload = {
    code: this.form.code,
    description: this.form.description,
    discountType: Number(this.form.discountType),
    discountValue: this.form.discountValue,
    minAmount: this.form.minAmount,
    maxDiscount: this.form.maxDiscount || null,
validFrom: new Date(this.form.validFrom + 'T' + new Date().toISOString().split('T')[1]).toISOString(),    validTo: new Date(this.form.validTo).toISOString(),
    maxUses: this.form.maxUses,
    maxUsesPerUser: this.form.maxUsesPerUser
  };

  this.promotionService.createPromotion(payload).subscribe({
    next: res => {
      if (res.success) {
        this.successMessage = 'Promotion créée !';
        this.showForm = false;
        this.loadPromotions();
        setTimeout(() => this.successMessage = '', 3000);
      }
      this.savingPromo = false;
    },
    error: (err) => {
      this.errorMessage = err.error?.title || 'Erreur lors de la création';
      this.savingPromo = false;
    }
  });
}

  deletePromotion(id: number): void {
    if (!confirm('Désactiver cette promotion ?')) return;
    this.deletingId = id;
    this.promotionService.deactivatePromotion(id).subscribe({
      next: () => {
        this.loadPromotions();
        this.deletingId = null;
        this.successMessage = 'Promotion désactivée';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.deletingId = null
    });
  }

  isExpired(validTo: string): boolean {
    return new Date(validTo) < new Date();
  }
}