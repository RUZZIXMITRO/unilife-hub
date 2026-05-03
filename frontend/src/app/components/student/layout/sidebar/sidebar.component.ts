import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { SocialService } from '../../../../services/social.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  @Input()  collapsed = false;
  @Output() sidebarToggled = new EventEmitter<boolean>();
  @Output() openProfile    = new EventEmitter<void>();
  @Output() openSettings   = new EventEmitter<void>();

  userName    = 'Étudiant';
  todoBadge   = 3;
  socialBadge = 0;
  friendRequestsBadge = 0;

  // État des sous-menus
  ecommerceExpanded = false;
  socialExpanded    = false;

  constructor(
    public  router:        Router,
    private authService:   AuthService,
    private userService:   UserService,
    private socialService: SocialService
  ) {}

  ngOnInit(): void {
    this.loadUserName();
    // Ouvre le sous-menu E‑Commerce si on est dans /student/ecommerce
    this.ecommerceExpanded = this.router.url.includes('/student/ecommerce');
    // Ouvre le sous-menu Social si on est dans /student/social
    this.socialExpanded = this.router.url.includes('/student/social');

    // Notifications non lues (badge sur l’icône cloche)
    this.socialService.unreadCount$.subscribe(count => {
      this.socialBadge = count;
    });
    this.socialService.getUnreadCount().subscribe();

    // Demandes d’amis en attente (badge sur "Amis")
    this.loadFriendRequestsBadge();
  }

  loadFriendRequestsBadge(): void {
    this.socialService.getPendingRequests().subscribe({
      next: (res: any) => {
        if (res.success) this.friendRequestsBadge = res.data.length;
      },
      error: () => { this.friendRequestsBadge = 0; }
    });
  }

  loadUserName(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      const u = this.authService.getCurrentUser();
      if (u) this.userName = u.email?.split('@')[0] || '';
      return;
    }
    this.userService.getUserByCredentialId(userId).subscribe({
      next:  (r) => { if (r.success && r.data) this.userName = r.data.name || 'Étudiant'; },
      error: ()  => {
        const u = this.authService.getCurrentUser();
        if (u) this.userName = u.email?.split('@')[0] || '';
      }
    });
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.sidebarToggled.emit(this.collapsed);
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  toggleEcommerce(): void {
    this.ecommerceExpanded = !this.ecommerceExpanded;
  }

  toggleSocial(): void {
    this.socialExpanded = !this.socialExpanded;
  }
}