import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  activeTab = 'general';
  showToast = false;
  toastMessage = '';
  isDarkMode = false;

  tabs = [
    { id: 'general', label: 'Général', icon: 'fa-gear' },
    { id: 'security', label: 'Sécurité', icon: 'fa-shield-halved' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
    { id: 'appearance', label: 'Apparence', icon: 'fa-palette' }
  ];

  colorOptions = [
    { label: 'Bleu', value: '#2563eb' },
    { label: 'Violet', value: '#7c3aed' },
    { label: 'Vert', value: '#16a34a' },
    { label: 'Rouge', value: '#dc2626' },
    { label: 'Orange', value: '#ea580c' },
    { label: 'Rose', value: '#db2777' }
  ];

  languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' }
  ];

  settings = {
    general: {
      platformName: 'UniLife Hub',
      contactEmail: 'admin@unilifehub.com',
      selectedLanguage: 'fr',
      maintenanceMode: false,
      registrationOpen: true,
      emailVerification: true
    },
    security: {
      minPasswordLength: 8,
      sessionDuration: 24,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      twoFactorAuth: false,
      allowMultipleSessions: true
    },
    notifications: {
      newUserEmail: true,
      reportEmail: true,
      weeklyReport: false,
      systemAlerts: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#2563eb'
    }
  };

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Charger depuis localStorage
    this.loadSettings();

    // Sync thème
    this.themeService.darkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
      this.settings.appearance.theme = isDark ? 'dark' : 'light';
    });
  }

  loadSettings(): void {
    const saved = localStorage.getItem('admin_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.settings = { ...this.settings, ...parsed };
    }
  }

  saveGeneral(): void {
    localStorage.setItem('admin_settings', JSON.stringify(this.settings));
    localStorage.setItem('language', this.settings.general.selectedLanguage);
    localStorage.setItem('maintenanceMode', String(this.settings.general.maintenanceMode));
    this.showSuccess('Paramètres généraux enregistrés !');
  }

  saveSecurity(): void {
    localStorage.setItem('admin_settings', JSON.stringify(this.settings));
    this.showSuccess('Paramètres de sécurité enregistrés !');
  }

  saveNotifications(): void {
    localStorage.setItem('admin_settings', JSON.stringify(this.settings));
    this.showSuccess('Préférences de notifications enregistrées !');
  }

  setTheme(mode: 'light' | 'dark' | 'system'): void {
    this.settings.appearance.theme = mode;
    if (mode === 'dark' && !this.isDarkMode) {
      this.themeService.toggleTheme();
    } else if (mode === 'light' && this.isDarkMode) {
      this.themeService.toggleTheme();
    }
    localStorage.setItem('admin_settings', JSON.stringify(this.settings));
  }

  
  showSuccess(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}