import { Component } from '@angular/core';

@Component({
  selector: 'app-why-us',
  templateUrl: './why-us.component.html',
  styleUrls: ['./why-us.component.css']
})
export class WhyUsComponent {
  whyCards = [
    {
      icon: 'fas fa-tasks',
      title: 'Organisation Simplifiée',
      description: 'Centralisez toutes vos tâches, cours et événements dans un seul espace intuitif et facile à utiliser.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Sécurité Garantie',
      description: 'Vos données sont protégées avec les plus hauts standards de sécurité et de confidentialité.'
    },
    {
      icon: 'fas fa-users',
      title: 'Collaboration Facilitée',
      description: 'Travaillez en équipe, partagez vos ressources et connectez-vous avec d\'autres étudiants.'
    },
    {
      icon: 'fas fa-bolt',
      title: 'Efficacité Maximale',
      description: 'Gagnez du temps avec des outils intelligents conçus pour optimiser votre productivité.'
    }
  ];
}