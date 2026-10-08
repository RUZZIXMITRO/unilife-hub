import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  userName          = '';
  userEmail         = '';
  searchQuery       = '';
  todayLabel        = '';
  isDarkMode        = false;
  showProfileMenu   = false;
  showNotifMenu     = false;
  showMsgMenu       = false;
  showProfileModal  = false;
  showSettingsModal = false;
  showHelpModal     = false;
  unreadMessages    = 2;
  msgSearch         = '';
  quickMessage      = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.todayLabel = new Date().toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'short'
    });
    this.themeService.darkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
  }

  loadUserProfile(): void {
    const authUser = this.authService.getCurrentUser();
    if (authUser?.email) this.userEmail = authUser.email;
    const userId = this.authService.getUserId();
    if (!userId) {
      if (authUser) this.userName = authUser.email?.split('@')[0] || '';
      return;
    }
    this.userService.getUserByCredentialId(userId).subscribe({
      next:  (r) => { if (r.success && r.data) this.userName = r.data.name || authUser?.email?.split('@')[0] || ''; },
      error: ()  => { if (authUser) this.userName = authUser.email?.split('@')[0] || ''; }
    });
  }

  toggleTheme():   void { this.themeService.toggleTheme(); }

  toggleProfileMenu(): void { this.showProfileMenu = !this.showProfileMenu; this.showNotifMenu = false; this.showMsgMenu = false; }
  toggleNotifMenu():   void { this.showNotifMenu   = !this.showNotifMenu;   this.showProfileMenu = false; this.showMsgMenu = false; }
  toggleMsgMenu():     void { this.showMsgMenu     = !this.showMsgMenu;     this.showNotifMenu = false; this.showProfileMenu = false; }

  openProfileModal():   void { this.showProfileModal  = true;  this.showProfileMenu = false; }
  closeProfileModal():  void { this.showProfileModal  = false; this.loadUserProfile(); }
  openSettingsModal():  void { this.showSettingsModal = true;  this.showProfileMenu = false; }
  closeSettingsModal(): void { this.showSettingsModal = false; }
  openHelpModal():      void { this.showHelpModal     = true;  this.showProfileMenu = false; }
  closeHelpModal():     void { this.showHelpModal     = false; }

  openConversation(id: string): void {
    this.showMsgMenu = false;
    this.router.navigate(['/student/messages', id]);
  }

  sendQuickMessage(): void {
    if (this.quickMessage.trim()) this.quickMessage = '';
  }

  logout(): void { this.authService.logout(); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!document.querySelector('.profile-dropdown')?.contains(target)) this.showProfileMenu = false;
    if (!document.querySelector('.notif-btn')?.contains(target))        this.showNotifMenu   = false;
    if (!document.querySelector('.msg-btn')?.contains(target))          this.showMsgMenu     = false;
  }
}