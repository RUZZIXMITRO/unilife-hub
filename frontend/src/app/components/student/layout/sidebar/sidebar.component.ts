import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() sidebarToggled = new EventEmitter<boolean>();

  menuItems: MenuItem[] = [
    { icon: 'fa-solid fa-house', label: 'Dashboard', route: '/student/dashboard' },
    { icon: 'fa-solid fa-calendar-check', label: 'Agenda & To-Do', route: '/student/agenda', badge: 3 },
    { icon: 'fa-solid fa-book', label: 'Cours & Formations', route: '/student/courses' },
    { icon: 'fa-solid fa-cart-shopping', label: 'Commerce', route: '/student/commerce' },
    { icon: 'fa-solid fa-robot', label: 'Assistant IA', route: '/student/chatbot' },
    { icon: 'fa-solid fa-users', label: 'Réseau Social', route: '/student/social', badge: 5 }
  ];

  constructor(public router: Router) {}

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.sidebarToggled.emit(this.collapsed);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}