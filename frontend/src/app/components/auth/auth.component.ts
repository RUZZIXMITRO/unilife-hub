import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    studentId: '',
    agreeTerms: false
  };

  showForgotPasswordModal = false;
  forgotPasswordEmail = '';
  forgotPasswordError = '';
  forgotPasswordSuccess = '';
  isForgotPasswordLoading = false;

  constructor(
    private location: Location,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        (preloader as HTMLElement).style.display = 'none';
      }, 500);
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogin() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Connexion réussie ! Bienvenue sur UniLife Hub.';
          console.log('✅ Login successful:', response);

          const credentialId = response.data.user.id;
          console.log('🔍 CredentialId:', credentialId);

          // ✅ VÉRIFIER LE VRAI RÔLE DEPUIS USERSERVICE (source de vérité)
          this.checkRoleAndRedirect(credentialId);

        } else {
          this.errorMessage = response.message || 'Erreur de connexion';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Login error:', error);
        this.errorMessage = error.error?.message || 'Email ou mot de passe incorrect';
      }
    });
  }

 private checkRoleAndRedirect(credentialId: string): void {
  console.log('🔍 Vérification rôle pour credentialId:', credentialId);

  this.userService.getUserByCredentialId(credentialId).subscribe({
    next: (response) => {
      console.log('✅ Profil trouvé:', response);

      if (response.success && response.data) {
        const userRole = response.data.role?.toString().toUpperCase();
        console.log('🎭 Rôle depuis UserService:', userRole);

        this.authService.markProfileAsCompleted();

        if (userRole === 'ADMIN') {
          console.log('🔑 ADMIN détecté → /admin/dashboard');
          setTimeout(() => this.router.navigate(['/admin/dashboard']), 1000);
        } else {
          console.log('👨‍🎓 STUDENT détecté → /student/dashboard');
          setTimeout(() => this.router.navigate(['/student/dashboard']), 1000);
        }
      }
    },
    error: (error) => {
      if (error.status === 404) {
        console.log('❌ Profil non trouvé → /complete-profile');
        setTimeout(() => this.router.navigate(['/complete-profile']), 1000);
      } else {
        setTimeout(() => this.router.navigate(['/student/dashboard']), 1000);
      }
    }
  });
}

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (!this.registerData.agreeTerms) {
      this.errorMessage = 'Veuillez accepter les conditions d\'utilisation.';
      return;
    }

    if (!this.registerData.fullName || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.isLoading = true;

    const registerPayload = {
      email: this.registerData.email,
      password: this.registerData.password,
      confirmPassword: this.registerData.confirmPassword
    };

    this.authService.register(registerPayload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Inscription réussie ! Complétez votre profil.';
          console.log('✅ Register successful:', response);

          setTimeout(() => {
            this.router.navigate(['/complete-profile']);
          }, 1000);
        } else {
          this.errorMessage = response.message || 'Erreur lors de l\'inscription';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Register error:', error);
        if (error.error?.errors && error.error.errors.length > 0) {
          this.errorMessage = error.error.errors.join(', ');
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
        }
      }
    });
  }

  goBack() {
    this.location.back();
  }

  openForgotPasswordModal() {
    this.showForgotPasswordModal = true;
    this.forgotPasswordEmail = '';
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = '';
  }

  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
  }

  onRequestPasswordReset() {
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = '';

    if (!this.forgotPasswordEmail) {
      this.forgotPasswordError = 'Veuillez entrer votre email';
      return;
    }

    this.isForgotPasswordLoading = true;

    this.authService.requestPasswordReset(this.forgotPasswordEmail).subscribe({
      next: (response) => {
        this.isForgotPasswordLoading = false;
        this.forgotPasswordSuccess = '✅ Un email de réinitialisation a été envoyé à votre adresse !';
        console.log('Password reset email sent:', response);

        setTimeout(() => {
          this.closeForgotPasswordModal();
        }, 3000);
      },
      error: (error) => {
        this.isForgotPasswordLoading = false;
        this.forgotPasswordError = 'Erreur lors de l\'envoi de l\'email';
        console.error('Password reset error:', error);
      }
    });
  }
}