import { Component, OnInit } from '@angular/core';
import { CatalogService } from '../../../../services/catalog.service';
import { InventoryService } from '../../../../services/inventory.service';
import { CloudinaryService } from '../../../../services/cloudinary.service';
import { Product, Category } from '../../../../models/ecommerce.models';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  showForm = false;
  editingProduct: Product | null = null;
  savingProduct = false;
  deletingId: string | null = null;
  successMessage = '';
  errorMessage = '';
  searchKeyword = '';
  uploadingImage = false;
  uploadedImageUrl = '';
  showCategoryForm = false;
  newCategoryName = '';
  savingCategory = false;
  showCategoriesManager = false;
  editingCategory: any = null;
  editCategoryName = '';
  deletingCategoryId: string | null = null;
  productToDelete: string | null = null;

  // Variantes
  colors: { name: string; hex: string; imageUrl?: string }[] = [];
  sizes: string[] = [];
  newColorName = '';
  newColorHex = '#000000';
  newSize = '';
  colorImageUrl = '';
  uploadingColorImage = false;

  form = {
    title: '',
    description: '',
    price: 0,
    categoryId: '',
    condition: 'Neuf',
    sellerId: 1,
    imageUrls: [] as string[],
    attributes: {} as any,
    stockQuantity: 10,
    alertThreshold: 5
  };

  attributeKey = '';
  attributeValue = '';
  conditions = ['Neuf', 'Occasion', 'Bon état', 'État correct'];

  constructor(
    private catalogService: CatalogService,
    private inventoryService: InventoryService,
    private cloudinaryService: CloudinaryService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading = true;
    this.catalogService.getProducts().subscribe({
      next: res => {
        if (res.success) this.products = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadCategories(): void {
    this.catalogService.getCategories().subscribe({
      next: res => { if (res.success) this.categories = res.data; }
    });
  }

  openCreateForm(): void {
    this.editingProduct = null;
    this.form = {
      title: '', description: '', price: 0,
      categoryId: '', condition: 'Neuf', sellerId: 1,
      imageUrls: [], attributes: {},
      stockQuantity: 10, alertThreshold: 5
    };
    this.uploadedImageUrl = '';
    this.attributeKey = '';
    this.attributeValue = '';
    this.errorMessage = '';
    this.showCategoryForm = false;
    this.newCategoryName = '';
    this.colors = [];
    this.sizes = [];
    this.newColorName = '';
    this.newColorHex = '#000000';
    this.newSize = '';
    this.colorImageUrl = '';
    this.showForm = true;
  }

  openEditForm(product: Product): void {
    this.editingProduct = product;
    const attrs = product.attributes ? { ...product.attributes } : {};
    const savedColors = attrs['couleurs'] || [];
    this.colors = savedColors.map((c: any) =>
      typeof c === 'object' ? c : { name: c, hex: '#000000', imageUrl: '' }
    );
    this.sizes = Array.isArray(attrs['tailles']) ? [...attrs['tailles']] : [];
    delete attrs['couleurs'];
    delete attrs['tailles'];
    this.form = {
      title: product.title,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      condition: product.condition,
      sellerId: product.sellerId,
      imageUrls: product.images?.map(i => i.imageUrl) || [],
      attributes: attrs,
      stockQuantity: product.stockQuantity || 0,
      alertThreshold: 5
    };
    this.uploadedImageUrl = this.form.imageUrls[0] || '';
    this.errorMessage = '';
    this.showCategoryForm = false;
    this.newColorName = '';
    this.newColorHex = '#000000';
    this.newSize = '';
    this.colorImageUrl = '';
    this.showForm = true;
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.uploadingImage = true;
    this.cloudinaryService.uploadImage(file).subscribe({
      next: res => {
        if (res.secure_url) {
          this.uploadedImageUrl = res.secure_url;
          this.form.imageUrls = [res.secure_url];
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.errorMessage = 'Erreur upload image';
        this.uploadingImage = false;
      }
    });
  }

  onColorImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.uploadingColorImage = true;
    this.cloudinaryService.uploadImage(file).subscribe({
      next: res => {
        if (res.secure_url) this.colorImageUrl = res.secure_url;
        this.uploadingColorImage = false;
      },
      error: () => this.uploadingColorImage = false
    });
  }

  // Couleurs
  addColor(): void {
    if (!this.newColorName.trim()) return;
    if (!this.colors.find(c => c.name === this.newColorName.trim())) {
      this.colors.push({
        name: this.newColorName.trim(),
        hex: this.newColorHex,
        imageUrl: this.colorImageUrl
      });
    }
    this.newColorName = '';
    this.newColorHex = '#000000';
    this.colorImageUrl = '';
  }

  removeColor(color: { name: string; hex: string; imageUrl?: string }): void {
    this.colors = this.colors.filter(c => c.name !== color.name);
  }

  // Tailles
  addSize(): void {
    if (!this.newSize.trim()) return;
    if (!this.sizes.includes(this.newSize.trim())) {
      this.sizes.push(this.newSize.trim());
    }
    this.newSize = '';
  }

  removeSize(size: string): void {
    this.sizes = this.sizes.filter(s => s !== size);
  }

  createCategory(): void {
    if (!this.newCategoryName.trim()) return;
    this.savingCategory = true;
    this.catalogService.createCategory({ name: this.newCategoryName }).subscribe({
      next: res => {
        if (res.success) {
          this.categories.push(res.data);
          this.newCategoryName = '';
          this.showCategoryForm = false;
          this.successMessage = 'Catégorie créée !';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.savingCategory = false;
      },
      error: () => this.savingCategory = false
    });
  }

  addAttribute(): void {
    if (!this.attributeKey.trim() || !this.attributeValue.trim()) return;
    this.form.attributes[this.attributeKey] = this.attributeValue;
    this.attributeKey = '';
    this.attributeValue = '';
  }

  removeAttribute(key: string): void {
    delete this.form.attributes[key];
  }

  getAttributeKeys(): string[] {
    return Object.keys(this.form.attributes);
  }

  saveProduct(): void {
    if (!this.form.title || !this.form.price || !this.form.categoryId) {
      this.errorMessage = 'Titre, prix et catégorie sont obligatoires';
      return;
    }
    this.savingProduct = true;
    this.errorMessage = '';

    const attributes = { ...this.form.attributes };
    if (this.colors.length > 0) attributes['couleurs'] = this.colors;
    if (this.sizes.length > 0) attributes['tailles'] = this.sizes;

    const payload = {
      title: this.form.title,
      description: this.form.description,
      price: this.form.price,
      categoryId: this.form.categoryId,
      condition: this.form.condition,
      sellerId: this.form.sellerId,
      imageUrls: this.form.imageUrls,
      attributes
    };

    if (this.editingProduct) {
      this.catalogService.updateProduct(this.editingProduct.id, payload).subscribe({
        next: res => {
          if (res.success) {
            this.successMessage = 'Produit mis à jour !';
            this.showForm = false;
            this.loadProducts();
            setTimeout(() => this.successMessage = '', 3000);
          }
          this.savingProduct = false;
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la mise à jour';
          this.savingProduct = false;
        }
      });
    } else {
      this.catalogService.createProduct(payload).subscribe({
        next: res => {
          if (res.success) {
            this.successMessage = 'Produit créé ! Pensez à ajouter le stock dans Inventaire.';
            this.showForm = false;
            this.loadProducts();
            setTimeout(() => this.successMessage = '', 5000);
          }
          this.savingProduct = false;
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la création';
          this.savingProduct = false;
        }
      });
    }
  }

  deleteProduct(id: string): void {
    this.productToDelete = id;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;
    const id = this.productToDelete;
    this.productToDelete = null;
    this.deletingId = id;
    this.catalogService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
        this.deletingId = null;
        this.successMessage = 'Produit supprimé';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.deletingId = null
    });
  }

  getPrimaryImage(product: Product): string {
    const primary = product.images?.find(i => i.primary);
    return primary?.imageUrl || 'https://placehold.co/400x400?text=no+image';
  }

  get filteredProducts(): Product[] {
    if (!this.searchKeyword.trim()) return this.products;
    return this.products.filter(p =>
      p.title.toLowerCase().includes(this.searchKeyword.toLowerCase())
    );
  }

  openCategoriesManager(): void {
    this.showCategoriesManager = true;
  }

  startEditCategory(cat: any): void {
    this.editingCategory = cat;
    this.editCategoryName = cat.name;
  }

  saveEditCategory(): void {
    if (!this.editingCategory || !this.editCategoryName.trim()) return;
    this.catalogService.updateCategory(this.editingCategory.id, { name: this.editCategoryName }).subscribe({
      next: res => {
        if (res.success) {
          const idx = this.categories.findIndex(c => c.id === this.editingCategory.id);
          if (idx !== -1) this.categories[idx].name = this.editCategoryName;
          this.editingCategory = null;
          this.successMessage = 'Catégorie modifiée !';
          setTimeout(() => this.successMessage = '', 3000);
        }
      }
    });
  }

  deleteCategory(id: string): void {
    const hasProducts = this.products.some(p => p.categoryId === id);
    if (hasProducts) {
      this.errorMessage = 'Impossible — des produits utilisent cette catégorie !';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }
    this.deletingCategoryId = id;
    this.catalogService.deleteCategory(id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== id);
        this.deletingCategoryId = null;
        this.successMessage = 'Catégorie supprimée !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.deletingCategoryId = null;
        this.errorMessage = 'Erreur lors de la suppression !';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  removeImage(): void {
  this.uploadedImageUrl = '';
  this.form.imageUrls = [];
}
}