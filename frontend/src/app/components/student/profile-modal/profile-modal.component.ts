import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { UserService, UserResponse } from '../../../services/user.service';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css']
})
export class ProfileModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<void>();

  user: UserResponse | null = null;
  isLoading = true;
  activeTab: 'info' | 'security' = 'info';

  isEditingInfo = false;
  isSavingInfo = false;
  infoSuccessMessage = '';
  infoErrorMessage = '';

  profileForm = {
    name: '',
    phone: '',
    university: '',
    studentId: '',
    academicYear: '',
    bio: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: ''
  };

  isChangingPassword = false;
  passwordSuccessMessage = '';
  passwordErrorMessage = '';

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.close();
      return;
    }

    this.userService.getUserByCredentialId(userId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.user = response.data;
          
          // ✅ CORRECTION : Utiliser l'email d'authentification
          const authUser = this.authService.getCurrentUser();
          if (authUser && authUser.email) {
            this.user.email = authUser.email;
          }
          
          this.populateForm();
          console.log('✅ Modal Profil - Nom:', this.user.name);
          console.log('✅ Modal Profil - Email:', this.user.email);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erreur chargement profil:', error);
      }
    });
  }

  populateForm(): void {
    if (this.user) {
      let formattedDate = '';
      if (this.user.profile?.dateOfBirth) {
        const date = new Date(this.user.profile.dateOfBirth);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }

      this.profileForm = {
        name: this.user.name || '',
        phone: this.user.phone || '',
        university: this.user.university || '',
        studentId: this.user.studentId || '',
        academicYear: this.user.academicYear || '',
        bio: this.user.bio || '',
        dateOfBirth: formattedDate,
        address: this.user.profile?.address || '',
        city: this.user.profile?.city || '',
        country: this.user.profile?.country || ''
      };
    }
  }

  switchTab(tab: 'info' | 'security'): void {
    this.activeTab = tab;
    this.infoSuccessMessage = '';
    this.infoErrorMessage = '';
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';
  }

  toggleEditInfo(): void {
    this.isEditingInfo = !this.isEditingInfo;
    if (!this.isEditingInfo) {
      this.populateForm();
    }
    this.infoSuccessMessage = '';
    this.infoErrorMessage = '';
  }

  saveProfile(): void {
    if (!this.user) return;

    this.isSavingInfo = true;
    this.infoErrorMessage = '';
    this.infoSuccessMessage = '';

    const updateData = {
      name: this.profileForm.name,
      phone: this.profileForm.phone,
      university: this.profileForm.university,
      studentId: this.profileForm.studentId,
      academicYear: this.profileForm.academicYear,
      bio: this.profileForm.bio,
      dateOfBirth: this.profileForm.dateOfBirth,
      address: this.profileForm.address,
      city: this.profileForm.city,
      country: this.profileForm.country
    };

    this.userService.updateUserProfile(this.user.id, updateData).subscribe({
      next: (response) => {
        this.isSavingInfo = false;
        
        if (response.success) {
          this.user = response.data;
          
          // ✅ GARDER L'EMAIL D'AUTH APRÈS UPDATE
          const authUser = this.authService.getCurrentUser();
          if (authUser && authUser.email) {
            this.user.email = authUser.email;
          }
          
          this.isEditingInfo = false;
          this.infoSuccessMessage = 'Profil mis à jour avec succès !';
          this.populateForm();
          this.profileUpdated.emit();
          
          setTimeout(() => {
            this.infoSuccessMessage = '';
          }, 3000);
        }
      },
      error: (error) => {
        this.isSavingInfo = false;
        this.infoErrorMessage = error.error?.message || 'Erreur lors de la mise à jour';
        
        setTimeout(() => {
          this.infoErrorMessage = '';
        }, 5000);
      }
    });
  }

  changePassword(): void {
    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';

    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmNewPassword) {
      this.passwordErrorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.passwordErrorMessage = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmNewPassword) {
      this.passwordErrorMessage = 'Les nouveaux mots de passe ne correspondent pas';
      return;
    }

    if (this.passwordForm.currentPassword === this.passwordForm.newPassword) {
      this.passwordErrorMessage = 'Le nouveau mot de passe doit être différent de l\'ancien';
      return;
    }

    this.isChangingPassword = true;

    this.authService.changePassword(this.passwordForm).subscribe({
      next: (response) => {
        this.isChangingPassword = false;
        
        if (response.success) {
          this.passwordSuccessMessage = 'Mot de passe changé avec succès ! Vous allez être déconnecté...';
          this.resetPasswordForm();
          
          setTimeout(() => {
            this.authService.logout();
          }, 2000);
        }
      },
      error: (error) => {
        this.isChangingPassword = false;
        this.passwordErrorMessage = error.error?.message || 'Erreur lors du changement de mot de passe';
        
        setTimeout(() => {
          this.passwordErrorMessage = '';
        }, 5000);
      }
    });
  }

  resetPasswordForm(): void {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    };
  }

  close(): void {
    this.closeModal.emit();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}