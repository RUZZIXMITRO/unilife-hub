import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthComponent } from './components/auth/auth.component';
import { CompleteProfileComponent } from './components/complete-profile/complete-profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { StudentLayoutComponent } from './components/student/layout/student-layout/student-layout.component';
import { StudentDashboardComponent } from './components/student/dashboard/student-dashboard/student-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  // ========== PUBLIQUES ==========
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // ========== COMPLETE PROFILE ==========
  {
    path: 'complete-profile',
    component: CompleteProfileComponent,
    canActivate: [AuthGuard]
  },

  // ========== INTERFACE ÉTUDIANTE ==========
  {
    path: 'student',
    component: StudentLayoutComponent,  // ✅ Layout parent avec sidebar/topbar/modals
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      // 🔜 À ajouter plus tard :
      // { path: 'agenda', component: AgendaComponent },
      // { path: 'courses', component: CoursesComponent },
      // { path: 'commerce', component: CommerceComponent },
      // { path: 'chatbot', component: ChatbotComponent },
      // { path: 'social', component: SocialComponent },
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