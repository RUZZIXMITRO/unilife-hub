import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-advantages',
  templateUrl: './advantages.component.html',
  styleUrls: ['./advantages.component.css']
})
export class AdvantagesComponent implements OnInit, AfterViewInit {
  advantages = [
    {
      number: '01',
      icon: 'fas fa-clock',
      title: 'Gain de Temps Considérable',
      description: 'Centralisez tous vos outils académiques en un seul endroit. Finis les multiples applications et sites web à jongler - tout est à portée de main.',
      statValue: '5h+',
      statLabel: 'économisées/semaine'
    },
    {
      number: '02',
      icon: 'fas fa-chart-line',
      title: 'Amélioration des Performances',
      description: 'Suivez vos progrès en temps réel, identifiez vos points forts et zones d\'amélioration grâce à des outils d\'analyse avancés.',
      statValue: '+25%',
      statLabel: 'de productivité moyenne'
    },
    {
      number: '03',
      icon: 'fas fa-wallet',
      title: 'Économies Financières',
      description: 'Accédez à des ressources partagées, achetez et vendez du matériel d\'occasion via le marketplace, et économisez sur vos frais universitaires.',
      statValue: '300€+',
      statLabel: 'économisés/an'
    },
    {
      number: '04',
      icon: 'fas fa-network-wired',
      title: 'Réseau & Collaboration',
      description: 'Connectez-vous avec des milliers d\'étudiants, partagez des connaissances, travaillez en équipe et construisez votre réseau professionnel.',
      statValue: '10k+',
      statLabel: 'étudiants connectés'
    },
    {
      number: '05',
      icon: 'fas fa-mobile-alt',
      title: 'Accessibilité Totale',
      description: 'Accédez à vos outils depuis n\'importe où, n\'importe quand. Application mobile et web entièrement synchronisées pour une flexibilité maximale.',
      statValue: '24/7',
      statLabel: 'disponible partout'
    },
    {
      number: '06',
      icon: 'fas fa-graduation-cap',
      title: 'Réussite Académique',
      description: 'Planifiez efficacement vos révisions, gérez vos deadlines et utilisez des outils d\'apprentissage intelligents pour maximiser vos chances de réussite.',
      statValue: '95%',
      statLabel: 'de taux de satisfaction'
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

      const revealElements = this.el.nativeElement.querySelectorAll('.advantage-card');
      revealElements.forEach((el: Element) => observer.observe(el));
    }, 100);
  }
}