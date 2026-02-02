import { Component } from '@angular/core';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent {

  stats = [
    {
      value: '10K+',
      label: 'Étudiants inscrits'
    },
    {
      value: '50+',
      label: 'Universités partenaires'
    },
    {
      value: '100%',
      label: 'Plateforme gratuite'
    }
  ];

}