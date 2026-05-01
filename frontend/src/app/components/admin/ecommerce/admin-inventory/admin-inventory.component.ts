import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../../services/inventory.service';
import { CatalogService } from '../../../../services/catalog.service';

@Component({
  selector: 'app-admin-inventory',
  templateUrl: './admin-inventory.component.html',
  styleUrls: ['./admin-inventory.component.css']
})
export class AdminInventoryComponent implements OnInit {
  stocks: any[] = [];
  lowStocks: any[] = [];
  loading = true;
  showAddModal = false;
  selectedStock: any = null;
  addQuantity = 0;
  addReason = '';
  processingId: string | null = null;
  successMessage = '';
  activeTab = 'all';

  constructor(
    private inventoryService: InventoryService,
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.loadStocks();
    this.loadLowStocks();
  }

  loadStocks(): void {
    this.loading = true;
    this.inventoryService.getAllStock().subscribe({
      next: res => {
        if (res.success) this.stocks = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadLowStocks(): void {
    this.inventoryService.getLowStock().subscribe({
      next: res => { if (res.success) this.lowStocks = res.data; }
    });
  }

  openAddModal(stock: any): void {
    this.selectedStock = stock;
    this.addQuantity = 0;
    this.addReason = '';
    this.showAddModal = true;
  }

  addStock(): void {
    if (!this.selectedStock || this.addQuantity <= 0) return;
    this.processingId = this.selectedStock.productId;
    this.inventoryService.addStock(
      this.selectedStock.productId,
      this.addQuantity,
      this.addReason
    ).subscribe({
      next: res => {
        if (res.success) {
          this.successMessage = 'Stock mis à jour !';
          this.showAddModal = false;
          this.loadStocks();
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.processingId = null;
      },
      error: () => this.processingId = null
    });
  }

  get displayedStocks(): any[] {
    if (this.activeTab === 'low') return this.lowStocks;
    return this.stocks;
  }

  getStockStatus(stock: any): string {
    if (stock.quantityAvailable === 0) return 'out';
    if (stock.quantityAvailable <= stock.alertThreshold) return 'low';
    return 'ok';
  }

  getStockBarWidth(stock: any): number {
    if (!stock.maxCapacity) return Math.min(stock.quantityAvailable, 100);
    return Math.min((stock.quantityAvailable / stock.maxCapacity) * 100, 100);
  }
}