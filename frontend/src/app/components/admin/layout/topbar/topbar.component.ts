import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-admin-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class AdminTopbarComponent implements OnInit {

  @Output() menuToggle = new EventEmitter<void>();

  currentTime = '';
  currentDate = '';
  searchQuery = '';
  showNotifications = false;
  showProfile = false;
  isDarkMode = false;
  adminEmail = '';

  notifications = [
    { id: 1, title: 'Nouvel utilisateur', message: 'Marie Dubois s\'est inscrite',      time: '5 min',  icon: 'fa-user-plus',      type: 'info',    unread: true  },
    { id: 2, title: 'Signalement',        message: 'Contenu signalé dans Marketplace',  time: '12 min', icon: 'fa-flag',           type: 'warning', unread: true  },
    { id: 3, title: 'Nouveau cours',      message: 'Introduction à React.js publié',    time: '1h',     icon: 'fa-graduation-cap', type: 'success', unread: false }
  ];

  unreadCount = 0;

  constructor(
    private authService: AuthService,
    public router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
    this.unreadCount = this.notifications.filter(n => n.unread).length;
    this.themeService.darkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
    const user = this.authService.getCurrentUser();
    this.adminEmail = user?.email || 'admin@unilifehub.com';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-wrapper')) this.showNotifications = false;
    if (!target.closest('.profile-wrapper'))      this.showProfile = false;
  }

  toggleTheme(): void       { this.themeService.toggleTheme(); }
  toggleNotifications(): void { this.showNotifications = !this.showNotifications; }
  toggleProfile(): void     { this.showProfile = !this.showProfile; }

  updateDateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    this.currentDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) console.log('🔍 Recherche:', this.searchQuery);
  }

  markAsRead(notification: any): void {
    notification.unread = false;
    this.unreadCount = this.notifications.filter(n => n.unread).length;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.unread = false);
    this.unreadCount = 0;
  }

  viewAllNotifications(): void {
    this.showNotifications = false;
    this.router.navigate(['/admin/notifications']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}