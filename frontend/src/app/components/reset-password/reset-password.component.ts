import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  isTokenValid: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Récupérer le token depuis l'URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.isTokenValid = false;
        this.errorMessage = 'Token de réinitialisation invalide ou manquant.';
      }
    });
  }

  onResetPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validations
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(this.token, this.newPassword, this.confirmPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = '✅ Votre mot de passe a été réinitialisé avec succès !';
        
        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Reset password error:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la réinitialisation. Le lien a peut-être expiré.';
      }
    });
  }
}