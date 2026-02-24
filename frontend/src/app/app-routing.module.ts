import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthComponent } from './components/auth/auth.component';
import { CompleteProfileComponent } from './components/complete-profile/complete-profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  // ========== ROUTES PUBLIQUES (Site vitrine) ==========
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // ========== COMPLETE PROFILE (Transition) ==========
  { 
    path: 'complete-profile', 
    component: CompleteProfileComponent,
    canActivate: [AuthGuard]
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