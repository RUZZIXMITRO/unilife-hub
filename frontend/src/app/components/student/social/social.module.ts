import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialRoutingModule } from './social-routing.module';
import { FeedComponent } from './feed/feed.component';
import { FriendsComponent } from './friends/friends.component';
import { GroupsComponent } from './groups/groups.component';
import { MessagesComponent } from './messages/messages.component';
import { NotificationsComponent } from './notifications/notifications.component';

@NgModule({
  declarations: [
    FeedComponent,
    FriendsComponent,
    GroupsComponent,
    MessagesComponent,
    NotificationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SocialRoutingModule
  ]
})
export class SocialModule {}