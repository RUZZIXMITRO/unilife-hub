import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  stats = [
    { icon: 'fas fa-users', number: '10,000+', label: 'Étudiants actifs' },
    { icon: 'fas fa-university', number: '50+', label: 'Universités partenaires' },
    { icon: 'fas fa-book', number: '500+', label: 'Cours disponibles' },
    { icon: 'fas fa-certificate', number: '5,000+', label: 'Certificats délivrés' }
  ];

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, { threshold: 0.5 });

    const statsSection = this.el.nativeElement.querySelector('.stats');
    if (statsSection) {
      observer.observe(statsSection);
    }
  }
}