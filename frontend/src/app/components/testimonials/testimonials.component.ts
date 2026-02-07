import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent {
  testimonials = [
    {
      quote: '"UniLife Hub a complètement transformé ma façon d\'organiser mes études. Tout est centralisé et facile à utiliser. Je recommande vivement !"',
      avatar: 'MS',
      name: 'Etudiant 1',
      role: 'Étudiante en Droit'
    },
    {
      quote: '"Le marketplace est génial ! J\'ai pu vendre mes anciens livres et acheter ceux dont j\'avais besoin à prix réduit. Très pratique."',
      avatar: 'AB',
      name: 'Etudiant 2',
      role: 'Étudiant en Commerce'
    },
    {
      quote: '"L\'interface est moderne et intuitive. J\'ai gagné énormément de temps dans la gestion de mon emploi du temps et mes projets. Parfait !"',
      avatar: 'LC',
      name: 'Etudiant 3',
      role: 'Étudiante en Informatique'
    }
  ];
}