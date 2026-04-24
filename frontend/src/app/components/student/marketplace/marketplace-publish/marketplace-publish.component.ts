import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../../../services/marketplace.service';
import { CloudinaryService } from '../../../../services/cloudinary.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-marketplace-publish',
  templateUrl: './marketplace-publish.component.html',
  styleUrls: ['./marketplace-publish.component.css']
})
export class MarketplacePublishComponent {
  loading = false;
  uploadingImage = false;
  success = false;
  error = '';
  imagePreview: string | null = null;
  imageUrl: string | null = null;

    categories = ['Livres & Cours', 'Informatique', 'Mobilier', 'Sport', 'Autre'];
  conditions = ['Neuf', 'Très bon état', 'Bon état', 'État correct', 'Mauvais état'];

  form = {
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    phone: '',
    email: ''
  };

  constructor(
    private marketplaceService: MarketplaceService,
    private cloudinaryService: CloudinaryService,
    private toast: ToastService,
    private router: Router
  ) {}

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Image trop lourde (max 5MB)');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e: any) => this.imagePreview = e.target.result;
    reader.readAsDataURL(file);

    // Upload Cloudinary
    this.uploadingImage = true;
    this.cloudinaryService.uploadImage(file).subscribe({
      next: (data) => {
        this.imageUrl = data.secure_url;
        this.uploadingImage = false;
        this.toast.success('Photo uploadée !');
      },
      error: () => {
        this.uploadingImage = false;
        this.toast.error('Erreur upload image');
      }
    });
  }

  removeImage(): void {
    this.imagePreview = null;
    this.imageUrl = null;
  }

  submit(): void {
    if (!this.form.title || !this.form.price) {
      this.error = 'Titre et prix sont obligatoires.';
      return;
    }

    if (!this.imageUrl) {
      this.error = 'Une photo est obligatoire.';
      return;
    }

    if (this.uploadingImage) {
      this.error = 'Attends la fin de l\'upload de l\'image.';
      return;
    }

    this.loading = true;
    this.error = '';

    const payload = { ...this.form, imageUrls: [this.imageUrl] };

    this.marketplaceService.createListing(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.toast.success('Annonce publiée, en attente de validation !');
        setTimeout(() => this.router.navigate(['/student/marketplace/my-listings']), 2000);
      },
      error: () => {
        this.loading = false;
        this.error = 'Une erreur est survenue.';
        this.toast.error('Erreur lors de la publication');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/student/marketplace']);
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
}