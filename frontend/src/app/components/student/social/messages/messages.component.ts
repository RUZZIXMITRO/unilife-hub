import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { SocialService, Message, Conversation } from '../../../../services/social.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesList') messagesList!: ElementRef;

  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  selectedUserId: number | null = null;
  messages: Message[] = [];
  newMessage = '';
  isLoading = false;
  isLoadingConversations = false;
  currentUserId: number = 0;
  shouldScroll = false;

  constructor(private socialService: SocialService) {}

  ngOnInit(): void {
    // Récupérer l'userId depuis le JWT
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.userId || payload.sub || 0;
      } catch (e) {
        this.currentUserId = 0;
      }
    }
    this.loadConversations();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  // ===== CHARGER LES CONVERSATIONS =====
  loadConversations(): void {
    this.isLoadingConversations = true;
    this.socialService.getConversations().subscribe({
      next: (res) => {
        if (res.success) this.conversations = res.data;
        this.isLoadingConversations = false;
      },
      error: () => { this.isLoadingConversations = false; }
    });
  }

  // ===== SÉLECTIONNER UNE CONVERSATION =====
  selectConversation(conv: Conversation): void {
    this.selectedConversation = conv;
    // Trouver l'interlocuteur (pas le currentUser)
    this.selectedUserId = conv.user1Id === this.currentUserId
      ? conv.user2Id
      : conv.user1Id;
    this.loadMessages(this.selectedUserId);
  }

  loadMessages(userId: number): void {
    this.isLoading = true;
    this.messages = [];
    this.socialService.getConversation(userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.messages = res.data;
          this.shouldScroll = true;
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  // ===== ENVOYER UN MESSAGE =====
  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedUserId) return;
    const content = this.newMessage;
    this.newMessage = '';

    this.socialService.sendMessage(this.selectedUserId, content).subscribe({
      next: (res) => {
        if (res.success) {
          this.messages.push(res.data);
          this.shouldScroll = true;
          // Mettre à jour le lastMessage dans la sidebar
          if (this.selectedConversation) {
            this.selectedConversation.lastMessage = content;
          }
        }
      }
    });
  }

  // ===== UTILITAIRES =====
  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  getInterlocutorId(conv: Conversation): number {
    return conv.user1Id === this.currentUserId ? conv.user2Id : conv.user1Id;
  }

  getConvInitial(conv: Conversation): string {
    const id = this.getInterlocutorId(conv);
    return String(id).charAt(0);
  }

  scrollToBottom(): void {
    try {
      if (this.messagesList) {
        this.messagesList.nativeElement.scrollTop =
          this.messagesList.nativeElement.scrollHeight;
      }
    } catch (e) {}
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}j`;
  }
}