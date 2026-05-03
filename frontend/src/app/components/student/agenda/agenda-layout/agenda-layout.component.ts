import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agenda-layout',
  templateUrl: './agenda-layout.component.html',
  styleUrls: ['./agenda-layout.component.css']
})
export class AgendaLayoutComponent {

  constructor(public router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}