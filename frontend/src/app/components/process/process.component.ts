import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent implements OnInit {
  @ViewChildren('timelineItem') timelineItems!: QueryList<ElementRef>;

  timelineData = [
    {
      icon: 'fas fa-user-plus',
      title: '1. Inscrivez-vous',
      description: 'Créez votre compte gratuitement en quelques minutes et accédez immédiatement à toutes les fonctionnalités de la plateforme.'
    },
    {
      icon: 'fas fa-cog',
      title: '2. Personnalisez votre profil',
      description: 'Configurez vos préférences, ajoutez vos cours et définissez vos objectifs académiques pour une expérience sur mesure.'
    },
    {
      icon: 'fas fa-compass',
      title: '3. Explorez les outils',
      description: 'Découvrez notre gamme complète d\'outils : agenda, marketplace, formations, réseau social et bien plus encore.'
    },
    {
      icon: 'fas fa-trophy',
      title: '4. Réussissez vos études',
      description: 'Utilisez nos outils pour organiser votre travail, collaborer avec d\'autres étudiants et atteindre vos objectifs académiques.'
    }
  ];

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.setupIntersectionObserver();
  }

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
      }, { threshold: 0.2 });

      const revealElements = this.el.nativeElement.querySelectorAll('.timeline-item');
      revealElements.forEach((el: Element) => observer.observe(el));
    }, 100);
  }
}