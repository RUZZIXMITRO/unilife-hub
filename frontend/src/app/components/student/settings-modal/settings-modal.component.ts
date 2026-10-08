import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ThemeService } from '../../../services/theme.service';

interface NotificationSettings {
  emailNewCourses: boolean;
  emailUpcomingTasks: boolean;
  emailMessages: boolean;
  pushNotifications: boolean;
  emailOrders: boolean;
}

interface PrivacySettings {
  showProfile: boolean;
  showCourses: boolean;
  allowMessages: boolean;
  showLastSeen: boolean;
}

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.css']
})
export class SettingsModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  activeTab: 'notifications' | 'appearance' | 'privacy' | 'account' = 'notifications';
  isDarkMode = false;
  selectedLanguage = 'fr';
  isSaving = false;
  isDeletingAccount = false;
  successMessage = '';
  errorMessage = '';

  notifications: NotificationSettings = {
    emailNewCourses: true,
    emailUpcomingTasks: true,
    emailMessages: true,
    pushNotifications: false,
    emailOrders: true
  };

  privacy: PrivacySettings = {
    showProfile: true,
    showCourses: true,
    allowMessages: true,
    showLastSeen: true
  };


  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSettings();

    this.themeService.darkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
  }

  loadSettings(): void {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      this.notifications = JSON.parse(savedNotifications);
    }

    const savedPrivacy = localStorage.getItem('privacy');
    if (savedPrivacy) {
      this.privacy = JSON.parse(savedPrivacy);
    }

  }

  switchTab(tab: 'notifications' | 'appearance' | 'privacy' | 'account'): void {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setTheme(mode: 'light' | 'dark'): void {
    if (mode === 'dark' && !this.isDarkMode) {
      this.themeService.toggleTheme();
    } else if (mode === 'light' && this.isDarkMode) {
      this.themeService.toggleTheme();
    }
  }



  saveNotifications(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.showSuccessMessage('Préférences de notifications sauvegardées !');
  }

  savePrivacy(): void {
    localStorage.setItem('privacy', JSON.stringify(this.privacy));
    this.showSuccessMessage('Paramètres de confidentialité sauvegardés !');
  }

  exportData(): void {
    this.isSaving = true;
    
    setTimeout(() => {
      const data = {
        notifications: this.notifications,
        privacy: this.privacy,
        language: this.selectedLanguage,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `unilife-settings-${Date.now()}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.isSaving = false;
      this.showSuccessMessage('Données exportées avec succès !');
    }, 1000);
  }

  // ✅ MÉTHODE DELETE ACCOUNT CORRIGÉE
  deleteAccount(): void {
    const confirmed = confirm(
      '⚠️ ATTENTION : Cette action est irréversible !\n\n' +
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ?\n\n' +
      '• Toutes vos données seront perdues\n' +
      '• Vos cours partagés seront supprimés\n' +
      '• Vos commandes seront annulées\n' +
      '• Vos messages seront effacés\n\n' +
      'Cette action ne peut pas être annulée.'
    );

    if (!confirmed) {
      return;
    }

    const doubleConfirm = prompt(
      '🚨 DERNIÈRE CONFIRMATION\n\n' +
      'Pour confirmer la suppression définitive de votre compte,\n' +
      'tapez "SUPPRIMER" en majuscules :'
    );

    if (doubleConfirm !== 'SUPPRIMER') {
      if (doubleConfirm !== null) {
        this.showErrorMessage('Suppression annulée. Vous devez taper exactement "SUPPRIMER".');
      }
      return;
    }

    this.isDeletingAccount = true;
    this.errorMessage = '';
    this.successMessage = '';

    const credentialId = this.authService.getUserId();

    if (!credentialId) {
      this.showErrorMessage('Impossible de récupérer votre identifiant utilisateur.');
      this.isDeletingAccount = false;
      return;
    }

    console.log('🗑️ Suppression du compte pour credentialId:', credentialId);

    // ✅ ÉTAPE 1 : Récupérer l'User par CredentialId pour avoir son vrai ID
    this.userService.getUserByCredentialId(credentialId).subscribe({
      next: (userResponse) => {
        if (!userResponse.success || !userResponse.data) {
          console.error('❌ Impossible de récupérer l\'utilisateur');
          this.isDeletingAccount = false;
          this.showErrorMessage('Erreur : Utilisateur introuvable.');
          return;
        }

        const realUserId = userResponse.data.id;
        console.log('✅ User trouvé, vrai userId:', realUserId);

        // ✅ ÉTAPE 2 : Supprimer l'utilisateur avec son vrai ID
        this.userService.deleteUser(realUserId).subscribe({
          next: (deleteResponse) => {
            console.log('✅ Utilisateur supprimé:', deleteResponse);

            // ✅ ÉTAPE 3 : Supprimer les credentials dans AuthService
            this.authService.deleteAccount().subscribe({
              next: (authResponse) => {
                console.log('✅ Compte supprimé:', authResponse);
                
                this.isDeletingAccount = false;
                this.successMessage = '✅ Votre compte a été supprimé avec succès. Vous allez être redirigé...';

                setTimeout(() => {
                  this.authService.logout();
                  this.router.navigate(['/']);
                }, 2000);
              },
              error: (authError) => {
                console.error('❌ Erreur suppression credentials:', authError);
                this.isDeletingAccount = false;
                
                this.showErrorMessage('Compte partiellement supprimé. Déconnexion en cours...');
                
                setTimeout(() => {
                  this.authService.logout();
                  this.router.navigate(['/']);
                }, 2000);
              }
            });
          },
          error: (deleteError) => {
            console.error('❌ Erreur suppression utilisateur:', deleteError);
            this.isDeletingAccount = false;
            this.showErrorMessage('Erreur lors de la suppression du compte. Veuillez réessayer.');
          }
        });
      },
      error: (userError) => {
        console.error('❌ Erreur récupération utilisateur:', userError);
        this.isDeletingAccount = false;
        this.showErrorMessage('Erreur : Impossible de récupérer vos informations.');
      }
    });
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  close(): void {
    this.closeModal.emit();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}