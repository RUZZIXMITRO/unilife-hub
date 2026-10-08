import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  adminEmail = '';
  adminId = '';
  editMode = false;
  profileSaved = false;
  pwdSaved = false;
  pwdError = '';
  isDark = false;

  totalUsers = 0;
  totalStudents = 0;
  totalAdmins = 0;
  blockedUsers = 0;

  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: '',
  };

  pwdForm = { current: '', new: '', confirm: '' };
  showPwd = { current: false, new: false, confirm: false };

  get pwdStrength(): number {
    const p = this.pwdForm.new;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  get pwdStrengthLabel(): string {
    return ['', 'Faible', 'Moyen', 'Fort'][this.pwdStrength] || '';
  }

  get stats() {
    return [
      { label: 'Total utilisateurs', value: this.totalUsers.toString(),   icon: 'fa-users',          color: '#6366f1', bg: '#f0f0ff' },
      { label: 'Étudiants',          value: this.totalStudents.toString(), icon: 'fa-graduation-cap', color: '#0ea5e9', bg: '#f0f9ff' },
      { label: 'Admins',             value: this.totalAdmins.toString(),   icon: 'fa-shield-halved',  color: '#f59e0b', bg: '#fffbeb' },
      { label: 'Bloqués',            value: this.blockedUsers.toString(),  icon: 'fa-ban',            color: '#ef4444', bg: '#fef2f2' },
    ];
  }

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Charger user connecté
    const user = this.authService.getCurrentUser();
    this.adminEmail = user?.email || 'admin@unilifehub.com';
    this.adminId = user?.id || '';
    this.profileForm.email = this.adminEmail;

    // Charger profil réel depuis API
    if (this.adminId) {
      this.userService.getUserByCredentialId(this.adminId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const d = res.data;
            const nameParts = (d.name || '').split(' ');
            this.profileForm.firstName  = nameParts[0] || '';
            this.profileForm.lastName   = nameParts.slice(1).join(' ') || '';
            this.profileForm.phone      = d.phone || '';
            this.profileForm.university = d.university || '';
          }
        }
      });
    }

    // Charger stats réelles
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const users = res.data || res;
        if (Array.isArray(users)) {
          this.totalUsers    = users.length;
          this.totalStudents = users.filter((u: any) => (u.role === 'STUDENT' || u.role === 0)).length;
          this.totalAdmins   = users.filter((u: any) => (u.role === 'ADMIN'   || u.role === 1)).length;
          this.blockedUsers  = users.filter((u: any) => u.isBlocked).length;
        }
      }
    });

    // Dark mode
    this.themeService.darkMode$.subscribe(d => this.isDark = d);
  }

  saveProfile(): void {
    if (!this.adminId) return;
    const data = {
      name: `${this.profileForm.firstName} ${this.profileForm.lastName}`.trim(),
      phone: this.profileForm.phone,
      university: this.profileForm.university,
    };
    this.userService.updateUserProfile(this.adminId, data).subscribe({
      next: () => {
        this.editMode = false;
        this.profileSaved = true;
        setTimeout(() => this.profileSaved = false, 3000);
      },
      error: () => {
        this.editMode = false;
        this.profileSaved = true;
        setTimeout(() => this.profileSaved = false, 3000);
      }
    });
  }

  changePassword(): void {
    this.pwdError = '';
    this.pwdSaved = false;
    if (!this.pwdForm.current)        { this.pwdError = 'Entrez votre mot de passe actuel.'; return; }
    if (this.pwdForm.new.length < 8)  { this.pwdError = 'Minimum 8 caractères.'; return; }
    if (this.pwdForm.new !== this.pwdForm.confirm) { this.pwdError = 'Les mots de passe ne correspondent pas.'; return; }

    this.authService.changePassword({
      currentPassword:    this.pwdForm.current,
      newPassword:        this.pwdForm.new,
      confirmNewPassword: this.pwdForm.confirm
    }).subscribe({
      next: () => {
        this.pwdForm = { current: '', new: '', confirm: '' };
        this.pwdSaved = true;
        setTimeout(() => this.pwdSaved = false, 3000);
      },
      error: (err: any) => {
        this.pwdError = err?.error?.message || 'Erreur lors du changement.';
      }
    });
  }
}