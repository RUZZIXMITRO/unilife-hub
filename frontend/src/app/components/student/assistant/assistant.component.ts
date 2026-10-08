import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AssistantService, AssistantMessage } from '../../../services/assistant.service';

@Component({
  selector: 'app-assistant',
  templateUrl: './assistant.component.html',
  styleUrls: ['./assistant.component.css']
})
export class AssistantComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  messages: AssistantMessage[] = [];
  inputMessage = '';
  isTyping = false;
  inputFocused = false;
  conversationId: string | null = null;
  userId = '';
  showSidebar = true;
  conversations: any[] = [];
  isDarkMode = false;

  quickQuestions = [
    "C'est quoi le polymorphisme en Java ?",
    "J'ai un examen demain, aide-moi",
    "Comment bien organiser mes révisions ?",
    "Explique les algorithmes de tri",
    "Conseils pour rédiger un bon CV",
    "What is a REST API ?"
  ];

  constructor(private assistantService: AssistantService) {}

  ngOnInit(): void {
    this.userId = this.assistantService.getUserId();
    this.showWelcome();
    this.loadConversations();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  showWelcome(): void {
    this.messages = [{
      role: 'assistant',
      content: 'Bonjour ! Je suis **UniAssist**, votre assistant IA étudiant \n\nJe peux vous aider avec vos **examens**, vos **cours**, la **programmation**, et bien plus encore.\n\nComment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
      suggestions: ['J\'ai un examen demain', 'Comment réviser efficacement ?', 'Explique-moi le polymorphisme']
    }];
  }

  loadConversations(): void {
    this.assistantService.getConversations(this.userId).subscribe({
      next: (res: any) => { if (res.success) this.conversations = res.data; }
    });
  }

  sendMessage(text?: string): void {
    const message = text || this.inputMessage.trim();
    if (!message || this.isTyping) return;

    this.messages.push({ role: 'user', content: message, timestamp: new Date() });
    this.inputMessage = '';
    this.isTyping = true;

    this.assistantService.sendMessage({
      message,
      user_id: this.userId,
      conversation_id: this.conversationId || undefined
    }).subscribe({
      next: res => {
        this.conversationId = res.conversation_id;
        this.messages.push({
          role: 'assistant',
          content: res.response,
          timestamp: new Date(),
          intent: res.intent,
          suggestions: res.suggestions
        });
        this.isTyping = false;
        this.loadConversations();
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
          content: 'Désolé, une erreur s\'est produite. Réessayez !',
          timestamp: new Date()
        });
        this.isTyping = false;
      }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  newConversation(): void {
    this.conversationId = null;
    this.showWelcome();
  }

  loadConversation(conv: any): void {
    this.conversationId = conv._id;
    this.messages = conv.messages.map((m: any) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date(m.timestamp)
    }));
  }

  deleteConversation(convId: string, event: Event): void {
    event.stopPropagation();
    this.assistantService.deleteConversation(convId).subscribe({
      next: () => {
        this.conversations = this.conversations.filter(c => c._id !== convId);
        if (this.conversationId === convId) this.newConversation();
      }
    });
  }

  toggleSidebar(): void { this.showSidebar = !this.showSidebar; }
  toggleDarkMode(): void { this.isDarkMode = !this.isDarkMode; }

  scrollToBottom(): void {
    try { this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }

  formatMessage(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  getConversationPreview(conv: any): string {
    const msgs = conv.messages || [];
    const last = msgs.filter((m: any) => m.role === 'user').pop();
    return last ? last.content.slice(0, 45) + '...' : 'Nouvelle conversation';
  }

  getConversationDate(conv: any): string {
    const date = new Date(conv.updated_at);
    const today = new Date();
    const diff = Math.floor((today.getTime() - date.getTime()) / 86400000);
    if (diff === 0) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (diff === 1) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
}