import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// ========== SERVICES ==========
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { ThemeService } from './services/theme.service';
import { AuthInterceptor } from './services/http-interceptor.service';

// ========== GUARDS ==========
import { AuthGuard } from './guards/auth.guard';

// ========== COMPONENTS - SITE PUBLIC ==========
import { HomeComponent } from './components/home/home.component';
import { PreloaderComponent } from './components/preloader/preloader.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { StatsComponent } from './components/stats/stats.component';
import { AboutComponent } from './components/about/about.component';
import { WhyUsComponent } from './components/why-us/why-us.component';
import { ProcessComponent } from './components/process/process.component';
import { FeaturesComponent } from './components/features/features.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { VisionMissionComponent } from './components/vision-mission/vision-mission.component';
import { AdvantagesComponent } from './components/advantages/advantages.component';
import { CtaComponent } from './components/cta/cta.component';
import { FaqComponent } from './components/faq/faq.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';

// ========== COMPONENTS - AUTH ==========
import { AuthComponent } from './components/auth/auth.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CompleteProfileComponent } from './components/complete-profile/complete-profile.component';

// ========== COMPONENTS - INTERFACE ÉTUDIANTE ==========
import { StudentLayoutComponent } from './components/student/layout/student-layout/student-layout.component';
import { SidebarComponent } from './components/student/layout/sidebar/sidebar.component';
import { TopbarComponent } from './components/student/layout/topbar/topbar.component';
import { StudentDashboardComponent } from './components/student/dashboard/student-dashboard/student-dashboard.component';
import { ProfileModalComponent } from './components/student/profile-modal/profile-modal.component';
import { SettingsModalComponent } from './components/student/settings-modal/settings-modal.component';
import { HelpModalComponent } from './components/student/help-modal/help-modal.component';

// ========== COMPONENTS - INTERFACE ADMIN ==========
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { SettingsComponent } from './components/admin/settings/settings.component';
import { HelpComponent } from './components/admin/help/help.component';
import { PromoteAdminComponent } from './components/setup/promote-admin/promote-admin.component';
import { AdminLayoutComponent } from './components/admin/layout/admin-layout/admin-layout.component';
import { AdminSidebarComponent } from './components/admin/layout/sidebar/sidebar.component';
import { AdminTopbarComponent } from './components/admin/layout/topbar/topbar.component';
import { UsersManagementComponent } from './components/admin/users-management/users-management.component';
import { ProfileComponent } from './components/admin/pages/profile/profile.component';
import { ReportsComponent } from './components/admin/pages/reports/reports.component';
// Enregistrer la locale française pour le DatePipe
registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    
    // Site Public
    HomeComponent,
    PreloaderComponent,
    NavbarComponent,
    HeroComponent,
    StatsComponent,
    AboutComponent,
    WhyUsComponent,
    ProcessComponent,
    FeaturesComponent,
    TestimonialsComponent,
    VisionMissionComponent,
    AdvantagesComponent,
    CtaComponent,
    FaqComponent,
    ContactComponent,
    FooterComponent,
    
    // Auth
    AuthComponent,
    ResetPasswordComponent,
    CompleteProfileComponent,
    
    // Interface Étudiante
    StudentLayoutComponent,
    SidebarComponent,
    TopbarComponent,
    StudentDashboardComponent,
    ProfileModalComponent,
    SettingsModalComponent,
    HelpModalComponent,
    
    // Interface Admin 
          AdminDashboardComponent,
          SettingsComponent,
          HelpComponent,
          PromoteAdminComponent,
          AdminLayoutComponent,
          AdminSidebarComponent,
          AdminTopbarComponent,
          UsersManagementComponent,
          ProfileComponent,
          ReportsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    UserService,
    ThemeService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }