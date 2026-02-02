import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';  // ← AJOUTER CETTE LIGNE

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isScrolled = false;

  constructor(private router: Router) {}  // ← AJOUTER CETTE LIGNE

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 50;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ← AJOUTER CES 2 MÉTHODES
  navigateToAuth() {
    this.router.navigate(['/auth']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
  openAuthPage() {
  window.location.href = '/auth';
}
}
