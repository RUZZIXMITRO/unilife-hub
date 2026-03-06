import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';  // ← AJOUT


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { AuthComponent } from './components/auth/auth.component';
import { HomeComponent } from './components/home/home.component';

import { AuthInterceptor } from './services/http-interceptor.service';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CompleteProfileComponent } from './components/complete-profile/complete-profile.component';
import { StudentDashboardComponent } from './components/student/dashboard/student-dashboard/student-dashboard.component';
import { StudentLayoutComponent } from './components/student/layout/student-layout/student-layout.component';
import { SidebarComponent } from './components/student/layout/sidebar/sidebar.component';
import { TopbarComponent } from './components/student/layout/topbar/topbar.component';
import { HelpModalComponent } from './components/student/help-modal/help-modal.component';
import { SettingsModalComponent } from './components/student/settings-modal/settings-modal.component';
import { ProfileModalComponent } from './components/student/profile-modal/profile-modal.component';

@NgModule({
  declarations: [
    AppComponent,
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
    AuthComponent,
    HomeComponent,
    ResetPasswordComponent,
    CompleteProfileComponent,
    StudentDashboardComponent,
    StudentLayoutComponent,
    SidebarComponent,
    TopbarComponent,
    HelpModalComponent,
    SettingsModalComponent,
    ProfileModalComponent,
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule  // ← AJOUT
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }  // ← AJOUT
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }