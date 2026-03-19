import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthComponent } from './components/auth/auth.component';
import { CompleteProfileComponent } from './components/complete-profile/complete-profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { StudentLayoutComponent } from './components/student/layout/student-layout/student-layout.component';
import { StudentDashboardComponent } from './components/student/dashboard/student-dashboard/student-dashboard.component';

// ✅ IMPORTS ADMIN
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { SettingsComponent } from './components/admin/settings/settings.component';
import { HelpComponent } from './components/admin/help/help.component';
import { PromoteAdminComponent } from './components/setup/promote-admin/promote-admin.component';


// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  // ========== ROUTES PUBLIQUES (Site vitrine) ==========
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'setup/promote', component: PromoteAdminComponent },

  // ========== COMPLETE PROFILE (Transition) ==========
  { 
    path: 'complete-profile', 
    component: CompleteProfileComponent,
    canActivate: [AuthGuard]
  },

  // ========== INTERFACE ÉTUDIANTE (Protégée) ==========
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      // 🔜 Autres routes à ajouter plus tard :
      // { path: 'agenda', component: AgendaComponent },
      // { path: 'courses', component: CoursesComponent },
      // { path: 'commerce', component: CommerceComponent },
      // { path: 'chatbot', component: ChatbotComponent },
      // { path: 'social', component: SocialComponent },
    ]
  },

  // ========== INTERFACE ADMIN (Protégée) ✅ NOUVEAU
 {
  path: 'admin',
  canActivate: [AuthGuard, AdminGuard],
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'help', component: HelpComponent },
  ]
},

  // ========== REDIRECTIONS ==========
  { path: 'dashboard', redirectTo: '/student/dashboard', pathMatch: 'full' },
  { path: 'profile', redirectTo: '/student/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }