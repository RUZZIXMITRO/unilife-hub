import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminDashboardComponent implements OnInit {

  isLoadingStats = true;

  stats = [
    { title: 'Utilisateurs Actifs', value: '...', change: '...', trend: 'up', icon: 'fa-users', color: 'blue' },
    { title: 'Ventes Marketplace',  value: '477',  change: '+18.4%', trend: 'up', icon: 'fa-store', color: 'green' },
    { title: 'Cours Publiés',       value: '387',  change: '+8.2%',  trend: 'up', icon: 'fa-graduation-cap', color: 'navy' },
    { title: 'Signalements',        value: '12',   change: '-15.3%', trend: 'down', icon: 'fa-flag', color: 'red' }
  ];

  recentActivities = [
    { id: 1, user: 'Jennie Kim',  avatar: 'JK', action: 'a créé un nouveau cours', title: 'Introduction à React.js',   time: '5 min',  icon: 'fa-graduation-cap', color: 'purple' },
    { id: 2, user: 'Zhao Lusi',   avatar: 'ZL', action: 'a effectué un achat',      title: 'MacBook Pro 14" — 1,299€', time: '12 min', icon: 'fa-shopping-cart',  color: 'green'  },
    { id: 3, user: 'Jiyeon Park', avatar: 'JP', action: 'a signalé un contenu',     title: 'Produit inapproprié',       time: '25 min', icon: 'fa-flag',           color: 'red'    },
    { id: 4, user: 'Lucas Petit', avatar: 'LP', action: 's\'est inscrit',           title: 'Nouveau membre',            time: '1h',     icon: 'fa-user-plus',      color: 'blue'   },
    { id: 5, user: 'Emma Roux',   avatar: 'ER', action: 'a publié un message',      title: 'Réseau Social',             time: '2h',     icon: 'fa-comment',        color: 'cyan'   }
  ];

  topCourses = [
    { title: 'Développement Web Complet',    instructor: 'Prof. Dubois',   students: 1247, rating: 4.9 },
    { title: 'Machine Learning avec Python', instructor: 'Dr. Martin',     students: 892,  rating: 4.8 },
    { title: 'Design UX/UI Moderne',         instructor: 'Sophie Laurent', students: 673,  rating: 4.7 },
    { title: 'Développement Mobile Flutter', instructor: 'Marc Rousseau',  students: 554,  rating: 4.6 }
  ];

  marketplaceStats = [
    { category: 'Livres & Cours',     sales: 234, revenue: '4,890€', trend: '+18%', color: 'blue'   },
    { category: 'Matériel Scolaire',  sales: 89,  revenue: '2,450€', trend: '+12%', color: 'green'  },
    { category: 'Électronique',       sales: 56,  revenue: '8,340€', trend: '+25%', color: 'purple' },
    { category: 'Services Étudiants', sales: 98,  revenue: '1,120€', trend: '+8%',  color: 'orange' }
  ];

  monthlyBars = [
    { label: 'Jan', pct: 45 },
    { label: 'Fév', pct: 70 },
    { label: 'Mar', pct: 58 },
    { label: 'Avr', pct: 92 },
    { label: 'Mai', pct: 75 },
    { label: 'Jun', pct: 88 },
    { label: 'Jul', pct: 62 },
    { label: 'Aoû', pct: 50 }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadUserStats(); }

  loadUserStats(): void {
    this.adminService.getUserStats().subscribe({
      next: (response) => {
        let users: any[] = [];
        if (response.data && Array.isArray(response.data)) users = response.data;
        else if (Array.isArray(response)) users = response;
        const total  = users.length;
        const actifs = users.filter((u: any) => !u.isBlocked && u.isActive).length;
        this.stats[0] = { title: 'Utilisateurs Actifs', value: actifs.toString(), change: `${total} au total`, trend: 'up', icon: 'fa-users', color: 'blue' };
        this.isLoadingStats = false;
      },
      error: () => {
        this.stats[0] = { ...this.stats[0], value: 'N/A', change: 'Erreur', trend: 'down' };
        this.isLoadingStats = false;
      }
    });
  }

  showAddUserModal = false;
  isAddingUser     = false;
  addUserError     = '';
  addUserSuccess   = '';
  newUser = { name: '', email: '', password: '', university: '', studentId: '', academicYear: '' };

  openAddUserModal(): void {
    this.showAddUserModal = true;
    this.addUserError = ''; this.addUserSuccess = '';
    this.newUser = { name: '', email: '', password: '', university: '', studentId: '', academicYear: '' };
  }

  closeAddUserModal(): void { if (!this.isAddingUser) this.showAddUserModal = false; }

  addUser(): void {
    if (!this.newUser.name.trim())  { this.addUserError = 'Le nom complet est obligatoire.'; return; }
    if (!this.newUser.email.trim()) { this.addUserError = 'L\'email est obligatoire.'; return; }
    if (!this.newUser.password.trim() || this.newUser.password.length < 8) {
      this.addUserError = 'Le mot de passe doit contenir au moins 8 caractères.'; return;
    }
    this.isAddingUser = true; this.addUserError = ''; this.addUserSuccess = '';
    this.adminService.registerUser(this.newUser.email, this.newUser.password).subscribe({
      next: (authRes) => {
        const credentialId = authRes.data?.user?.id;
        this.adminService.createUserProfile({
          credentialId, name: this.newUser.name, email: this.newUser.email,
          university: this.newUser.university || null,
          studentId: this.newUser.studentId || null,
          academicYear: this.newUser.academicYear || null
        }).subscribe({
          next: () => {
            this.isAddingUser = false;
            this.addUserSuccess = `✅ Utilisateur "${this.newUser.name}" créé avec succès !`;
            this.loadUserStats();
            setTimeout(() => this.closeAddUserModal(), 2000);
          },
          error: () => { this.isAddingUser = false; this.addUserError = 'Compte Auth créé mais profil non sauvegardé.'; }
        });
      },
      error: (err) => { this.isAddingUser = false; this.addUserError = err.error?.message || 'Email déjà utilisé ou erreur serveur.'; }
    });
  }
}