import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AgendaRoutingModule } from './agenda-routing.module';

import { AgendaLayoutComponent } from './components/agenda-layout/agenda-layout.component';
import { AgendaPageComponent } from './components/agenda-page/agenda-page.component';
import { TodosPageComponent } from './components/todos-page/todos-page.component';
import { NotificationsPageComponent } from './components/notifications-page/notifications-page.component';

import { EventService } from './services/event.service';
import { TodoService } from './services/todo.service';
import { AgendaNotificationService } from './services/agenda-notification.service';

@NgModule({
  declarations: [
    AgendaLayoutComponent,
    AgendaPageComponent,
    TodosPageComponent,
    NotificationsPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    AgendaRoutingModule
  ],
  providers: [
    EventService,
    TodoService,
    AgendaNotificationService
  ]
})
export class AgendaModule { }