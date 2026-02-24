import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'unilife-hub';
  showScrollTop = false;
  showPublicLayout = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Détecte les changements de route
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Masquer navbar/footer si on est dans l'espace étudiant
      this.showPublicLayout = !event.url.startsWith('/student') && !event.url.startsWith('/complete-profile');
      
      console.log('Route actuelle:', event.url);
      console.log('Afficher layout public:', this.showPublicLayout);
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showScrollTop = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}