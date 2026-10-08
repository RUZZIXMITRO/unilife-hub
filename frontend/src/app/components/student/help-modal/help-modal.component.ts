import { Component, Output, EventEmitter } from '@angular/core';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon: string;
  category: string;
  expanded: boolean;
}

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.css']
})
export class HelpModalComponent {
  @Output() closeModal = new EventEmitter<void>();

  searchQuery = '';
  selectedCategory = 'all';

  categories = [
    { id: 'all', name: 'Tout', icon: 'fa-solid fa-list' },
    { id: 'account', name: 'Compte', icon: 'fa-solid fa-user' },
    { id: 'agenda', name: 'Agenda', icon: 'fa-solid fa-calendar' },
    { id: 'courses', name: 'Cours', icon: 'fa-solid fa-book' },
    { id: 'commerce', name: 'Commerce', icon: 'fa-solid fa-cart-shopping' },
    { id: 'chatbot', name: 'Chatbot', icon: 'fa-solid fa-robot' }
  ];

  faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'Comment changer mon mot de passe ?',
      answer: 'Cliquez sur votre avatar en haut à droite → "Mon Profil" → Onglet "Sécurité" → Remplissez le formulaire avec votre mot de passe actuel et le nouveau mot de passe.',
      icon: 'fa-solid fa-key',
      category: 'account',
      expanded: false
    },
    {
      id: 2,
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Cliquez sur votre avatar → "Mon Profil" → Onglet "Informations" → Cliquez sur "Modifier" → Modifiez vos informations → Cliquez sur "Enregistrer".',
      icon: 'fa-solid fa-user-pen',
      category: 'account',
      expanded: false
    },
    {
      id: 3,
      question: 'Comment ajouter une tâche dans mon agenda ?',
      answer: 'Allez dans "Agenda & To-Do" dans le menu latéral → Cliquez sur le bouton "Ajouter une tâche" → Remplissez les détails (titre, date, priorité) → Validez.',
      icon: 'fa-solid fa-calendar-plus',
      category: 'agenda',
      expanded: false
    },
    {
      id: 4,
      question: 'Comment marquer une tâche comme terminée ?',
      answer: 'Dans votre Dashboard ou dans l\'Agenda, cochez simplement la case à gauche de la tâche. La tâche sera barrée et marquée comme complétée.',
      icon: 'fa-solid fa-square-check',
      category: 'agenda',
      expanded: false
    },
    {
      id: 5,
      question: 'Comment partager un cours avec d\'autres étudiants ?',
      answer: 'Allez dans "Cours & Formations" → Cliquez sur "Partager un cours" → Uploadez votre fichier → Ajoutez un titre et une description → Publiez.',
      icon: 'fa-solid fa-share-nodes',
      category: 'courses',
      expanded: false
    },
    {
      id: 6,
      question: 'Comment télécharger un cours partagé ?',
      answer: 'Allez dans "Cours & Formations" → Parcourez les cours disponibles → Cliquez sur le cours qui vous intéresse → Cliquez sur le bouton "Télécharger".',
      icon: 'fa-solid fa-download',
      category: 'courses',
      expanded: false
    },
    {
      id: 7,
      question: 'Comment acheter un produit sur le marketplace ?',
      answer: 'Allez dans "Commerce" → Parcourez les produits → Cliquez sur un produit → Cliquez sur "Ajouter au panier" → Allez dans votre panier → Validez la commande.',
      icon: 'fa-solid fa-bag-shopping',
      category: 'commerce',
      expanded: false
    },
    {
      id: 8,
      question: 'Comment vendre un produit ?',
      answer: 'Allez dans "Commerce" → "Vendre un produit" → Ajoutez des photos → Remplissez les détails (titre, prix, description) → Publiez votre annonce.',
      icon: 'fa-solid fa-tags',
      category: 'commerce',
      expanded: false
    },
    {
      id: 9,
      question: 'Comment utiliser le chatbot IA ?',
      answer: 'Cliquez sur "Chatbot IA" dans le menu → Tapez votre question dans la zone de texte → Appuyez sur Entrée. Le chatbot vous répondra instantanément.',
      icon: 'fa-solid fa-messages-question',
      category: 'chatbot',
      expanded: false
    },
    {
      id: 10,
      question: 'Comment activer les notifications ?',
      answer: 'Cliquez sur votre avatar → "Paramètres" → Onglet "Notifications" → Activez les notifications que vous souhaitez recevoir (email, push, etc.).',
      icon: 'fa-solid fa-bell',
      category: 'account',
      expanded: false
    },
    {
      id: 11,
      question: 'Comment changer le thème (clair/sombre) ?',
      answer: 'Cliquez sur l\'icône lune/soleil en haut à droite de la topbar pour basculer entre le mode clair et le mode sombre.',
      icon: 'fa-solid fa-moon',
      category: 'account',
      expanded: false
    },
    {
      id: 12,
      question: 'Comment contacter le support ?',
      answer: 'Vous pouvez nous contacter par email à support@unilifehub.com. Nous répondons généralement sous 24-48 heures.',
      icon: 'fa-solid fa-headset',
      category: 'account',
      expanded: false
    }
  ];

  get filteredFAQ(): FAQItem[] {
    let filtered = this.faqItems;

    // Filtrer par catégorie
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    // Filtrer par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  toggleFAQ(item: FAQItem): void {
    item.expanded = !item.expanded;
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  sendEmail(): void {
    window.location.href = 'mailto:support@unilifehub.com?subject=Demande d\'aide - UniLife Hub';
  }

  close(): void {
    this.closeModal.emit();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
  
}