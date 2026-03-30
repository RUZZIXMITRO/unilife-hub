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

  mainMenuItems = [
    { icon: 'fa-chart-line',     label: 'Vue d\'ensemble', route: '/admin/dashboard' },
    { icon: 'fa-users',          label: 'Utilisateurs',    route: '/admin/users' },
    { icon: 'fa-graduation-cap', label: 'Cours',           route: '/admin/courses' },
    { icon: 'fa-store',          label: 'Marketplace',     route: '/admin/marketplace' },
    { icon: 'fa-comments',       label: 'Gestion Chat',    route: '/admin/chat' },
    { icon: 'fa-flag',           label: 'Signalements',    route: '/admin/reports' },
    { icon: 'fa-chart-pie',      label: 'Statistiques',    route: '/admin/analytics' },
    { icon: 'fa-credit-card',    label: 'Paiements',       route: '/admin/payments' },
  ];

  bottomMenuItems = [
    { icon: 'fa-gear',           label: 'Paramètres',      route: '/admin/settings' },
    { icon: 'fa-circle-question', label: 'Aide',           route: '/admin/help' },
  ];

  constructor(
    public router: Router,
    private authService: AuthService,
    public sidebarState: SidebarStateService
  ) {
    const user = this.authService.getCurrentUser();
    this.adminEmail = user?.email || 'admin@unilifehub.com';
  }

  toggle(): void {
    this.sidebarState.toggle();
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
