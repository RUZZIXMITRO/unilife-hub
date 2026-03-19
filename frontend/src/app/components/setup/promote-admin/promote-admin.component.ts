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

  private authUrl = 'https://localhost:7076/api/Auth';
  private adminUrl = 'https://localhost:7212/api/Admin';
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

    // Étape 1 : Trouver l'utilisateur par email dans AuthService
    this.http.get<any>(
      `${this.authUrl}/all-users-with-profiles`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        const user = res.data.find((u: any) =>
          u.email.toLowerCase() === this.email.toLowerCase()
        );

        if (!user) {
          this.loading = false;
          this.error = 'Aucun compte trouvé avec cet email.';
          return;
        }

        if (user.role === 'ADMIN') {
          this.loading = false;
          this.error = 'Cet utilisateur est déjà administrateur.';
          return;
        }

        const credentialId = user.credentialId;

        // Étape 2 : Promouvoir dans AuthService
        this.http.post<any>(
          `${this.authUrl}/promote-to-admin/${credentialId}`,
          {},
          { headers: this.getHeaders() }
        ).subscribe({
          next: () => {
            // Étape 3 : Récupérer userId depuis UserService
            this.http.get<any>(
              `https://localhost:7212/api/Users/by-credential/${credentialId}`,
              { headers: this.getHeaders() }
            ).subscribe({
              next: (userRes) => {
                console.log('👤 UserRes complet:', userRes);
                console.log('👤 userId récupéré:', userRes.data?.id);
                const userId = userRes.data?.id;

                if (userId) {
                  console.log('📤 PUT vers:', `${this.adminUrl}/promote/${userId}`);
                  // Étape 4 : Promouvoir dans UserService
                  this.http.put<any>(
                    `${this.adminUrl}/promote/${userId}`,
                    {},
                    { headers: this.getHeaders() }
                  ).subscribe({
                    next: (promoteRes) => {
                      console.log('✅ UserService promu:', promoteRes);
                      this.loading = false;
                      this.success = `✅ ${this.email} est maintenant ADMIN ! Il doit se reconnecter.`;
                      this.email = '';
                      this.secretCode = '';
                    },
                    error: (err) => {
                      console.error('❌ Erreur UserService promote:', err);
                      this.loading = false;
                      this.success = `✅ ${this.email} est maintenant ADMIN ! Il doit se reconnecter.`;
                      this.email = '';
                      this.secretCode = '';
                    }
                  });
                } else {
                  this.loading = false;
                  this.success = `✅ ${this.email} est maintenant ADMIN ! Il doit se reconnecter.`;
                  this.email = '';
                  this.secretCode = '';
                }
              },
              error: (err) => {
                console.error('❌ Erreur récupération user:', err);
                this.loading = false;
                this.success = `✅ ${this.email} est maintenant ADMIN ! Il doit se reconnecter.`;
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
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Tu dois être connecté. Connecte-toi d\'abord puis reviens ici.';
        } else {
          this.error = 'Impossible de contacter le serveur.';
        }
      }
    });
  }
}