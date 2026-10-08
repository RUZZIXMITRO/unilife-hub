import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-promote-admin',
  templateUrl: './promote-admin.component.html',
  styleUrls: ['./promote-admin.component.css']
})
export class PromoteAdminComponent {
  email = '';
  secretCode = '';
  loading = false;
  success = '';
  error = '';

 private authUrl = 'https://localhost:5000/api/Auth';
private adminUrl = 'https://localhost:5000/api/Admin';
private userUrl = 'https://localhost:5000/api/Users';
  private SECRET = 'UNILIFE2026';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  submit(): void {
    if (!this.email || !this.secretCode) {
      this.error = 'Remplis tous les champs.';
      return;
    }

    if (this.secretCode !== this.SECRET) {
      this.error = 'Code secret invalide.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // Étape 1 : Trouver par email SANS token (AllowAnonymous)
    this.http.get<any>(
      `${this.authUrl}/find-by-email/${this.email}`
    ).subscribe({
      next: (res) => {
        if (!res.success) {
          this.loading = false;
          this.error = 'Aucun compte trouvé avec cet email.';
          return;
        }

        if (res.role === 'ADMIN') {
          this.loading = false;
          this.error = 'Cet utilisateur est déjà administrateur.';
          return;
        }

        const credentialId = res.credentialId;

        // Étape 2 : Promouvoir dans AuthService (AllowAnonymous)
        this.http.post<any>(
          `${this.authUrl}/promote-to-admin/${credentialId}`,
          {}
        ).subscribe({
          next: () => {

            // Étape 3 : Récupérer userId depuis UserService
            this.http.get<any>(
              `${this.userUrl}/by-credential/${credentialId}`
            ).subscribe({
              next: (userRes) => {
                const userId = userRes.data?.id;

                if (userId) {
                  // Étape 4 : Promouvoir dans UserService (AllowAnonymous)
                  this.http.put<any>(
                    `${this.adminUrl}/promote/${userId}`,
                    {}
                  ).subscribe({
                    next: () => {
                      this.loading = false;
                      this.success = `${this.email} est maintenant ADMIN ! Il doit se reconnecter.`;
                      this.email = '';
                      this.secretCode = '';
                    },
                    error: () => {
                      this.loading = false;
                      this.success = `${this.email} est maintenant ADMIN ! Il doit se reconnecter.`;
                      this.email = '';
                      this.secretCode = '';
                    }
                  });
                } else {
                  this.loading = false;
                  this.success = `${this.email} est maintenant ADMIN ! Il doit se reconnecter.`;
                  this.email = '';
                  this.secretCode = '';
                }
              },
              error: () => {
                this.loading = false;
                this.success = `${this.email} est maintenant ADMIN ! Il doit se reconnecter.`;
                this.email = '';
                this.secretCode = '';
              }
            });
          },
          error: (err) => {
            this.loading = false;
            this.error = err.error?.message || 'Erreur lors de la promotion.';
          }
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Aucun compte trouvé avec cet email.';
      }
    });
  }
}