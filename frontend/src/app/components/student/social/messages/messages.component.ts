import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { SocialService, Message, Conversation } from '../../../../services/social.service';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesList') messagesList!: ElementRef;

  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  selectedUserId: string | null = null;
  messages: Message[] = [];
  newMessage = '';
  isLoading = false;
  isLoadingConversations = false;
  currentUserId: string = '';
  shouldScroll = false;

  // ✅ Cache des noms
  private userNameCache: { [userId: string]: string } = {};

  constructor(
    private socialService: SocialService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUserId =
    this.authService.getCurrentUser()?.id || this.authService.getUserId() || '';
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
        if (res.success) {
          this.conversations = res.data;
          this.enrichConversationsWithUserNames(this.conversations);
        }
        this.isLoadingConversations = false;
      },
      error: () => { this.isLoadingConversations = false; }
    });
  }

  // ✅ Enrichir les conversations avec les vrais noms
  private enrichConversationsWithUserNames(conversations: Conversation[]): void {
  const uniqueUserIds = [...new Set(
    conversations
      .map(c => this.getInterlocutorId(c))
      .filter(id => id && !this.userNameCache[id])
  )];

  if (uniqueUserIds.length === 0) return;

  const requests = uniqueUserIds.map(userId =>
    this.userService.getUserByCredentialId(userId).pipe(
      map(res => ({
        userId,
        name: res.success && res.data?.name ? res.data.name : this.shortId(userId)
      })),
      catchError(() => of({ userId, name: this.shortId(userId) }))
    )
  );

  forkJoin(requests).subscribe(results => {
    results.forEach(r => {
      this.userNameCache[r.userId] = r.name;
    });
    // ✅ Forcer la mise à jour en recréant le tableau
    this.conversations = [...this.conversations];
  });
}

  // ===== SÉLECTIONNER UNE CONVERSATION =====
  selectConversation(conv: Conversation): void {
    this.selectedConversation = conv;
    this.selectedUserId = this.getInterlocutorId(conv);
    this.loadMessages(this.selectedUserId);
  }

  loadMessages(userId: string): void {
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
          if (this.selectedConversation) {
            this.selectedConversation.lastMessage = content;
            this.selectedConversation.lastMessageAt = new Date().toISOString();
          }
          // ✅ Recharger les conversations pour mettre à jour la sidebar
          this.loadConversations();
        }
      }
    });
  }

  // ===== UTILITAIRES =====
  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  getInterlocutorId(conv: Conversation): string {
    return conv.user1Id === this.currentUserId ? conv.user2Id : conv.user1Id;
  }

  // ✅ Retourne le vrai nom depuis le cache
  getConvName(conv: Conversation): string {
    const interlocutorId = this.getInterlocutorId(conv);
    return this.userNameCache[interlocutorId] || this.shortId(interlocutorId);
  }

  // ✅ Initiale depuis le vrai nom
  getConvInitial(conv: Conversation): string {
    return this.getConvName(conv).charAt(0).toUpperCase();
  }

  // ✅ Fallback : 8 premiers chars de l'UUID
  private shortId(userId: string): string {
    return userId ? userId.substring(0, 8) + '...' : 'Étudiant';
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