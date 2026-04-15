import { Component, OnInit } from '@angular/core';
import { SocialService, Message } from '../../../../services/social.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  conversations: any[] = [];
  selectedUserId: number | null = null;
  messages: Message[] = [];
  newMessage = '';
  isLoading = false;

  constructor(private socialService: SocialService) {}

  ngOnInit(): void {}

  selectConversation(userId: number): void {
    this.selectedUserId = userId;
    this.loadMessages(userId);
  }

  loadMessages(userId: number): void {
    this.isLoading = true;
    this.socialService.getConversation(userId).subscribe({
      next: (res) => {
        if (res.success) this.messages = res.data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedUserId) return;
    this.socialService.sendMessage(
      this.selectedUserId,
      this.newMessage
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.messages.push(res.data);
          this.newMessage = '';
        }
      }
    });
  }

  isMyMessage(message: Message): boolean {
    return message.senderId === 0;
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    return `${Math.floor(diff / 3600)}h`;
  }
}