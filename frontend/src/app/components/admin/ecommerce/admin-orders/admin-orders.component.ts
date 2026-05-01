import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../../services/order.service';
import { Order } from '../../../../models/ecommerce.models';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  selectedStatus = 'all';
  userNames: { [key: string]: string } = {};
  updatingId: number | null = null;
  successMessage = '';
  showStatusModal = false;
  selectedOrder: Order | null = null;
  newStatus = 0;
  statusComment = '';
  trackingNumber = '';

  statusFilters = [
    { key: 'all',        label: 'Toutes' },
    { key: 'Pending',    label: 'En attente' },
    { key: 'Confirmed',  label: 'Confirmées' },
    { key: 'Shipped',    label: 'Expédiées' },
    { key: 'Delivered',  label: 'Livrées' },
    { key: 'Cancelled',  label: 'Annulées' }
  ];

  statusOptions = [
    { value: 1, label: 'Confirmée' },
    { value: 2, label: 'En traitement' },
    { value: 3, label: 'Expédiée' },
    { value: 4, label: 'Livrée' },
    { value: 5, label: 'Annulée' }
  ];

  constructor(
    private orderService: OrderService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: res => {
        if (res.success) {
          this.orders = res.data;
          this.filteredOrders = res.data;
          this.loadUserNames(res.data);
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

loadUserNames(orders: Order[]): void {
  const userIds = [...new Set(orders.map(o => o.userId))];
  userIds.forEach(userId => {
    // Si c'est un UUID (contient des tirets)
    if (userId.includes('-')) {
      this.userService.getUserByCredentialId(userId).subscribe({
        next: res => {
          if (res.success && res.data) {
            this.userNames[userId] = res.data.name || res.data.email;
          } else {
            this.userNames[userId] = userId.slice(0, 8) + '...';
          }
        },
        error: () => {
          this.userNames[userId] = userId.slice(0, 8) + '...';
        }
      });
    } else {
      // Si c'est un int
      this.userService.getUserById(userId).subscribe({
        next: res => {
          if (res.success && res.data) {
            this.userNames[userId] = res.data.name || res.data.email;
          } else {
            this.userNames[userId] = 'Utilisateur #' + userId;
          }
        },
        error: () => {
          this.userNames[userId] = 'Utilisateur #' + userId;
        }
      });
    }
  });
}

  getUserName(userId: string): string {
    return this.userNames[userId] || userId.slice(0, 8) + '...';
  }

  getUserInitial(userId: string): string {
    const name = this.userNames[userId];
    if (name) return name[0].toUpperCase();
    return userId[0].toUpperCase();
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.filteredOrders = status === 'all'
      ? this.orders
      : this.orders.filter(o => o.status === status);
  }

  openStatusModal(order: Order): void {
    this.selectedOrder = order;
    this.newStatus = 0;
    this.statusComment = '';
    this.trackingNumber = order.trackingNumber || '';
    this.showStatusModal = true;
  }

  updateStatus(): void {
    if (!this.selectedOrder || !this.newStatus) return;
    this.updatingId = this.selectedOrder.id;
    this.orderService.updateOrderStatus(
      this.selectedOrder.id,
      Number(this.newStatus),
      this.statusComment,
      this.trackingNumber
    ).subscribe({
      next: res => {
        if (res.success) {
          this.successMessage = 'Statut mis à jour !';
          this.showStatusModal = false;
          this.loadOrders();
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.updatingId = null;
      },
      error: () => this.updatingId = null
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      'Pending':    'status-pending',
      'Confirmed':  'status-confirmed',
      'Processing': 'status-processing',
      'Shipped':    'status-shipped',
      'Delivered':  'status-delivered',
      'Cancelled':  'status-cancelled'
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
      'Cancelled':  'Annulée'
    };
    return map[status] || status;
  }
  orderToCancel: number | null = null;

cancelOrder(orderId: number): void {
  this.orderToCancel = orderId;
}

confirmCancel(): void {
  if (!this.orderToCancel) return;
  const id = this.orderToCancel;
  this.orderToCancel = null;
  this.updatingId = id;
  this.orderService.cancelOrder(id).subscribe({
    next: res => {
      if (res.success) {
        this.successMessage = 'Commande annulée !';
        this.loadOrders();
        setTimeout(() => this.successMessage = '', 3000);
      }
      this.updatingId = null;
    },
    error: () => this.updatingId = null
  });
}
}

