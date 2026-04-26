import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { AuthComponent } from './components/auth/auth.component';
import { CompleteProfileComponent } from './components/complete-profile/complete-profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

import { StudentLayoutComponent } from './components/student/layout/student-layout/student-layout.component';
import { StudentDashboardComponent } from './components/student/dashboard/student-dashboard/student-dashboard.component';
import { StudentCoursComponent } from './components/student/cours/student-cours.component';

import { AdminLayoutComponent } from './components/admin/layout/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { SettingsComponent } from './components/admin/settings/settings.component';
import { HelpComponent } from './components/admin/help/help.component';
import { AdminCoursFormationsComponent } from './components/admin/cours-formations/cours-formations.component';

import { PromoteAdminComponent } from './components/setup/promote-admin/promote-admin.component';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'setup/promote', component: PromoteAdminComponent },
  {
    path: 'complete-profile',
    component: CompleteProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'courses', component: StudentCoursComponent },
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'help', component: HelpComponent },
      { path: 'cours-formations', component: AdminCoursFormationsComponent },
    ]
  },
  { path: 'dashboard', redirectTo: '/student/dashboard', pathMatch: 'full' },
  { path: 'profile', redirectTo: '/student/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }