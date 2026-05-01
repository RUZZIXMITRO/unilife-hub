import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../services/order.service';
import { Order } from '../../../../models/ecommerce.models';
import { CatalogService } from '../../../../services/catalog.service';


@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  productImages: { [key: string]: string } = {};

  cancelling = false;

 constructor(
  private route: ActivatedRoute,
  private router: Router,
  private orderService: OrderService,
  private catalogService: CatalogService
) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadOrder(Number(id));
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.orderService.getOrderById(id).subscribe({
      next: res => {
        if (res.success) this.order = res.data;
        res.data.items.forEach((item: any) => {
  this.catalogService.getProductById(item.productId).subscribe({
    next: r => {
      if (r.success && r.data.images?.length > 0) {
        const primary = r.data.images.find((img: any) => img.primary);
        this.productImages[item.productId] = primary?.imageUrl || r.data.images[0].imageUrl;
      }
    }
  });
});
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  cancelOrder(): void {
    if (!this.order || !confirm('Annuler cette commande ?')) return;
    this.cancelling = true;
    this.orderService.cancelOrder(this.order.id).subscribe({
      next: res => {
        if (res.success) this.order = res.data;
        this.cancelling = false;
      },
      error: () => this.cancelling = false
    });
  }

  goBack(): void {
    this.router.navigate(['/student/ecommerce/orders']);
  }

  goToShop(): void {
    this.router.navigate(['/student/ecommerce']);
  }

  getStatusClass(status: string): string {
    const map: any = {
      'Pending':    'status-pending',
      'Confirmed':  'status-confirmed',
      'Processing': 'status-processing',
      'Shipped':    'status-shipped',
      'Delivered':  'status-delivered',
      'Cancelled':  'status-cancelled',
      'Refunded':   'status-refunded'
    };
    return map[status] || 'status-pending';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'Pending':    'En attente',
      'Confirmed':  'Confirmée',
      'Processing': 'En traitement',
      'Shipped':    'Expédiée',
      'Delivered':  'Livrée',
      'Cancelled':  'Annulée',
      'Refunded':   'Remboursée'
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

  canCancel(): boolean {
    return this.order?.status === 'Pending' || this.order?.status === 'Confirmed';
  }

  getStepStatus(step: string): string {
    if (!this.order) return 'inactive';
    const steps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = steps.indexOf(this.order.status);
    const stepIndex = steps.indexOf(step);
    if (this.order.status === 'Cancelled') return 'cancelled';
    if (stepIndex < currentIndex) return 'done';
    if (stepIndex === currentIndex) return 'active';
    return 'inactive';
  }
}