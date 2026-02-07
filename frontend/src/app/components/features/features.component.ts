import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit, AfterViewInit {
  features = [
    {
      icon: 'fas fa-calendar-alt',
      title: 'Agenda & To-Do',
      description: 'Organisez vos cours, examens et tâches dans un calendrier intelligent avec rappels automatiques.'
    },
    {
      icon: 'fas fa-robot',
      title: 'Chatbot Intelligent',
      description: 'Obtenez des réponses instantanées à vos questions académiques 24h/24 et 7j/7.'
    },
    {
      icon: 'fas fa-shopping-cart',
      title: 'Marketplace',
      description: 'Achetez et vendez du matériel scolaire entre étudiants en toute sécurité.'
    },
    {
      icon: 'fas fa-book-open',
      title: 'Partage de Cours',
      description: 'Accédez à une bibliothèque collaborative de notes et ressources partagées par la communauté.'
    },
    {
      icon: 'fas fa-user-friends',
      title: 'Réseau Étudiant',
      description: 'Connectez-vous et collaborez avec d\'autres étudiants de votre université et d\'ailleurs.'
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'Suivi Académique',
      description: 'Suivez votre progression, vos notes et vos performances académiques en temps réel.'
    }
  ];

  constructor(private el: ElementRef) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, { threshold: 0.1 });

      const revealElements = this.el.nativeElement.querySelectorAll('.feature-card');
      revealElements.forEach((el: Element) => observer.observe(el));
    }, 100);
  }
}