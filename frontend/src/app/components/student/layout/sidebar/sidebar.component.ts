import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';

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
  socialBadge = 5;

  constructor(
    public  router:      Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserName();
    // Auto-ouvrir le sous-menu si on est sur /student/social
this.socialExpanded = this.router.url.includes('/student/social');
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
  socialExpanded = false;
  toggleSocial(): void {
  this.socialExpanded = !this.socialExpanded;
}
}