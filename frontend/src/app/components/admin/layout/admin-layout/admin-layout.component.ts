import { Component, OnInit, HostListener } from '@angular/core';
import { SidebarStateService } from '../../../../services/sidebar-state.service';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  mobileOpen = false;
  isMobile = false;
  isDark = false;

  constructor(
    public sidebarState: SidebarStateService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.checkMobile();
    this.themeService.darkMode$.subscribe(d => this.isDark = d);
  }

  @HostListener('window:resize')
  checkMobile(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) this.mobileOpen = false;
  }
}