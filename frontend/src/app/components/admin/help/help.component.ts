import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent {

  activeCategory = 'general';
  searchQuery = '';
  expandedFaq: number | null = null;

  categories = [
    { id: 'general', label: 'Général', icon: 'fa-house' },
    { id: 'users', label: 'Utilisateurs', icon: 'fa-users' },
    { id: 'security', label: 'Sécurité', icon: 'fa-shield-halved' },
    { id: 'platform', label: 'Plateforme', icon: 'fa-gear' }
  ];

  faqs: { [key: string]: { id: number, question: string, answer: string }[] } = {
    general: [
      {
        id: 1,
        question: 'Comment accéder au tableau de bord administrateur ?',
        answer: 'Connectez-vous avec un compte ayant le rôle ADMIN. Vous serez automatiquement redirigé vers /admin/dashboard.'
      },
      {
        id: 2,
        question: 'Comment exporter les données de la plateforme ?',
        answer: 'Depuis le tableau de bord, cliquez sur le bouton "Exporter" en haut à droite pour télécharger un rapport.'
      },
      {
        id: 3,
        question: 'Comment changer la langue de l\'interface ?',
        answer: 'Allez dans Paramètres → Général, sélectionnez la langue souhaitée et cliquez sur Enregistrer.'
      }
    ],
    users: [
      {
        id: 4,
        question: 'Comment bloquer un utilisateur ?',
        answer: 'Dans Gestion des Utilisateurs, trouvez l\'utilisateur et cliquez sur l\'icône 🚫. Entrez la raison et confirmez.'
      },
      {
        id: 5,
        question: 'Comment promouvoir un étudiant en administrateur ?',
        answer: 'Dans la liste des utilisateurs, cliquez sur l\'icône 🛡️ à côté de l\'utilisateur pour le promouvoir au rôle ADMIN.'
      },
      {
        id: 6,
        question: 'Comment supprimer un compte utilisateur ?',
        answer: 'Cliquez sur l\'icône 🗑️ dans la liste des utilisateurs. La suppression est définitive et retire le compte des deux services.'
      }
    ],
    security: [
      {
        id: 7,
        question: 'Comment fonctionne l\'authentification JWT ?',
        answer: 'UniLife Hub utilise des tokens JWT avec AccessToken (1h) et RefreshToken (7j). Les tokens expirés redirigent automatiquement vers la connexion.'
      },
      {
        id: 8,
        question: 'Que faire si un admin perd son accès ?',
        answer: 'Contactez un autre administrateur pour qu\'il vous re-promote via la gestion des utilisateurs, ou accédez directement à la base de données.'
      },
      {
        id: 9,
        question: 'Comment sécuriser les mots de passe ?',
        answer: 'UniLife Hub utilise BCrypt pour le hachage des mots de passe. Configurez la longueur minimale dans Paramètres → Sécurité.'
      }
    ],
    platform: [
      {
        id: 10,
        question: 'Comment déployer avec Docker ?',
        answer: 'Exécutez "docker-compose up -d" à la racine du projet. Les 3 services (SQL Server, AuthService, UserService) démarrent automatiquement.'
      },
      {
        id: 11,
        question: 'Comment accéder à la documentation API ?',
        answer: 'Swagger UI est disponible sur https://localhost:7076/swagger pour AuthService et https://localhost:7212/swagger pour UserService.'
      },
      {
        id: 12,
        question: 'Comment activer le mode maintenance ?',
        answer: 'Allez dans Paramètres → Général et activez le toggle "Mode maintenance". Les utilisateurs verront une page d\'indisponibilité.'
      }
    ]
  };

  get filteredFaqs() {
    const faqs = this.faqs[this.activeCategory] || [];
    if (!this.searchQuery.trim()) return faqs;
    return faqs.filter(f =>
      f.question.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  toggleFaq(id: number): void {
    this.expandedFaq = this.expandedFaq === id ? null : id;
  }

  setCategory(id: string): void {
    this.activeCategory = id;
    this.expandedFaq = null;
  }
}