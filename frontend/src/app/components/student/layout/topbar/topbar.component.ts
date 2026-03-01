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
  userName = 'Étudiant';
  userEmail = '';
  showProfileMenu = false;
  showProfileModal = false;
  showSettingsModal = false;
  showHelpModal = false;  // ✅ NOUVEAU
  isDarkMode = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();

    this.themeService.darkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
  }

  loadUserProfile(): void {
    const userId = this.authService.getUserId();
    
    const authUser = this.authService.getCurrentUser();
    if (authUser && authUser.email) {
      this.userEmail = authUser.email;
    }
    
    if (!userId) {
      if (authUser) {
        this.userName = authUser.email.split('@')[0];
      }
      return;
    }

    this.userService.getUserByCredentialId(userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.userName = response.data.name || 'Étudiant';
          
          if (authUser && authUser.email) {
            this.userEmail = authUser.email;
          }
        }
      },
      error: (error) => {
        console.error('❌ Topbar - Erreur chargement profil:', error);
        
        if (authUser) {
          this.userName = authUser.email.split('@')[0];
        }
      }
    });
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  openProfileModal(): void {
    this.showProfileModal = true;
    this.showProfileMenu = false;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.loadUserProfile();
  }

  openSettingsModal(): void {
    this.showSettingsModal = true;
    this.showProfileMenu = false;
  }

  closeSettingsModal(): void {
    this.showSettingsModal = false;
  }

  // ✅ NOUVELLES MÉTHODES POUR LE MODAL AIDE
  openHelpModal(): void {
    this.showHelpModal = true;
    this.showProfileMenu = false;
  }

  closeHelpModal(): void {
    this.showHelpModal = false;
  }

  logout(): void {
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (profileDropdown && !profileDropdown.contains(target)) {
      this.showProfileMenu = false;
    }
  }
}