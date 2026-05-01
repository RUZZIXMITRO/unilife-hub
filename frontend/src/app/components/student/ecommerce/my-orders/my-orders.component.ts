import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../../services/order.service';
import { Order } from '../../../../models/ecommerce.models';
import { CatalogService } from '../../../../services/catalog.service';


@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  productImages: { [key: string]: string } = {};
  selectedStatus = 'all';
  cancellingId: number | null = null;

  statusFilters = [
    { key: 'all',       label: 'Toutes' },
    { key: 'Pending',   label: 'En attente' },
    { key: 'Confirmed', label: 'Confirmées' },
    { key: 'Shipped',   label: 'Expédiées' },
    { key: 'Delivered', label: 'Livrées' },
    { key: 'Cancelled', label: 'Annulées' }
  ];

constructor(
  private orderService: OrderService,
  private catalogService: CatalogService,
  private router: Router
) {}
  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: res => {
        if (res.success) {
          this.orders = res.data;
          // Charger les images des produits
res.data.forEach((order: Order) => {
  order.items.forEach(item => {
    if (!this.productImages[item.productId]) {
      this.catalogService.getProductById(item.productId).subscribe({
        next: r => {
          if (r.success && r.data.images?.length > 0) {
            const primary = r.data.images.find((img: any) => img.primary);
            this.productImages[item.productId] = primary?.imageUrl || r.data.images[0].imageUrl;
          }
        }
      });
    }
  });
});
          this.filteredOrders = res.data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    if (status === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(o => o.status === status);
    }
  }

 cancelOrder(orderId: number): void {
  if (!confirm('Annuler cette commande ?')) return;
  this.cancellingId = orderId;
  this.orderService.cancelOrder(orderId).subscribe({
    next: res => {
      if (res.success) {
        // Supprimer de la liste
        this.orders = this.orders.filter(o => o.id !== orderId);
        this.filteredOrders = this.filteredOrders.filter(o => o.id !== orderId);
      }
      this.cancellingId = null;
    },
    error: () => this.cancellingId = null
  });
}

  goToDetail(orderId: number): void {
    this.router.navigate(['/student/ecommerce/orders', orderId]);
  }

  goToShop(): void {
    this.router.navigate(['/student/ecommerce']);
  }

  getStatusClass(status: string): string {
    const map: any = {
      'Pending':   'status-pending',
      'Confirmed': 'status-confirmed',
      'Processing':'status-processing',
      'Shipped':   'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled',
      'Refunded':  'status-refunded'
    };
    return map[status] || 'status-pending';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'Pending':   'En attente',
      'Confirmed': 'Confirmée',
      'Processing':'En traitement',
      'Shipped':   'Expédiée',
      'Delivered': 'Livrée',
      'Cancelled': 'Annulée',
      'Refunded':  'Remboursée'
    };
    return map[status] || status;
  }

  getStatusIcon(status: string): string {
    const map: any = {
      'Pending':    'fa-clock',
      'Confirmed':  'fa-circle-check',
      'Processing': 'fa-gear',
      'Shipped':    'fa-truck',
      'Delivered':  'fa-box-open',
      'Cancelled':  'fa-xmark',
      'Refunded':   'fa-rotate-left'
    };
    return map[status] || 'fa-circle';
  }

  canCancel(status: string): boolean {
    return status === 'Pending' || status === 'Confirmed';
  }
  orderToCancel: number | null = null;

confirmCancel(): void {
  if (!this.orderToCancel) return;
  const id = this.orderToCancel;
  this.orderToCancel = null;
  this.cancellingId = id;
  this.orderService.cancelOrder(id).subscribe({
    next: res => {
      if (res.success) {
        this.orders = this.orders.filter(o => o.id !== id);
        this.filteredOrders = this.filteredOrders.filter(o => o.id !== id);
      }
      this.cancellingId = null;
    },
    error: () => this.cancellingId = null
  });
}
getCountByStatus(status: string): number {
  return this.orders.filter(o => o.status === status).length;
}
}