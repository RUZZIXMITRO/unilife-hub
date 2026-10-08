import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgendaLayoutComponent } from './components/agenda-layout/agenda-layout.component';
import { AgendaPageComponent } from './components/agenda-page/agenda-page.component';
import { TodosPageComponent } from './components/todos-page/todos-page.component';
import { NotificationsPageComponent } from './components/notifications-page/notifications-page.component';

const routes: Routes = [
  {
    path: '',
    component: AgendaLayoutComponent,
    children: [
      { path: '', component: AgendaPageComponent },
      { path: 'todos', component: TodosPageComponent },
      { path: 'notifications', component: NotificationsPageComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgendaRoutingModule { }