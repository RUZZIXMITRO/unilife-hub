import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { SidebarStateService } from '../../../../services/sidebar-state.service';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class AdminSidebarComponent {
  adminEmail = '';
  ecommerceExpanded = false;

  mainMenuItems = [
    { icon: 'fa-chart-line',      label: 'Vue d\'ensemble', route: '/admin/dashboard' },
    { icon: 'fa-users',           label: 'Utilisateurs',    route: '/admin/users' },
    { icon: 'fa-graduation-cap',  label: 'Cours',           route: '/admin/courses' },
    { icon: 'fa-store',           label: 'Marketplace',     route: '/admin/marketplace' },
    { icon: 'fa-comments',        label: 'Gestion Chat',    route: '/admin/chat' },
    { icon: 'fa-flag',            label: 'Signalements',    route: '/admin/reports' },
    { icon: 'fa-chart-pie',       label: 'Statistiques',    route: '/admin/analytics' },
    { icon: 'fa-credit-card',     label: 'Paiements',       route: '/admin/payments' },
  ];

  ecommerceMenuItems = [
    { icon: 'fa-box',             label: 'Produits',        route: '/admin/ecommerce/products' },
    { icon: 'fa-clipboard-list',  label: 'Commandes',       route: '/admin/ecommerce/orders' },
    { icon: 'fa-tag',             label: 'Promotions',      route: '/admin/ecommerce/promotions' },
    { icon: 'fa-star',            label: 'Avis',            route: '/admin/ecommerce/reviews' },
    { icon: 'fa-warehouse',       label: 'Inventaire',      route: '/admin/ecommerce/inventory' },
  ];

  bottomMenuItems = [
    { icon: 'fa-gear',            label: 'Paramètres',      route: '/admin/settings' },
    { icon: 'fa-circle-question', label: 'Aide',            route: '/admin/help' },
  ];

  constructor(
    public router: Router,
    private authService: AuthService,
    public sidebarState: SidebarStateService
  ) {
    const user = this.authService.getCurrentUser();
    this.adminEmail = user?.email || 'admin@unilifehub.com';
    // Auto-expand si on est sur une route e-commerce
    this.ecommerceExpanded = this.router.url.includes('/admin/ecommerce');
  }

  toggle(): void {
    this.sidebarState.toggle();
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  isEcommerceActive(): boolean {
    return this.router.url.includes('/admin/ecommerce');
  }

  toggleEcommerce(): void {
    this.ecommerceExpanded = !this.ecommerceExpanded;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}