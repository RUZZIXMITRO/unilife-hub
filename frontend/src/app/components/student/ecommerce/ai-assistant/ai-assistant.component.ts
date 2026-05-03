import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AiAssistantService } from '../../../../services/ai-assistant.service';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

@Component({
  selector: 'app-ai-assistant',
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.css']
})
export class AiAssistantComponent implements OnInit, OnDestroy {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  messages: Message[] = [];
  inputMessage = '';
  loading = false;
  conversationId: string | null = null;
  userId = '1';

  quickQuestions = [
    'Quels produits avez-vous ?',
    'Je cherche un livre de programmation',
    'Avez-vous des promotions ?',
    'Comment passer une commande ?'
  ];

  constructor(
    private aiService: AiAssistantService,
    private authService: AuthService,
    private router: Router
  ) {}

 ngOnInit(): void {
  const uid = this.authService.getUserId();
  if (uid) this.userId = uid;

  // Récupérer le conversationId sauvegardé
  const savedConvId = localStorage.getItem(`conv_${this.userId}`);
  if (savedConvId) {
    this.conversationId = savedConvId;
    // Charger l'historique
    this.loadConversationHistory(savedConvId);
  } else {
    this.showWelcomeMessage();
  }
}

loadConversationHistory(convId: string): void {
  this.aiService.getConversations(this.userId).subscribe({
    next: (res: any) => {
      const conv = res.data?.find((c: any) => c._id === convId);
      if (conv && conv.messages?.length > 0) {
        this.messages = conv.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp)
        }));
        setTimeout(() => this.scrollToBottom(), 100);
      } else {
        this.showWelcomeMessage();
      }
    },
    error: () => this.showWelcomeMessage()
  });
}

showWelcomeMessage(): void {
  this.messages.push({
    role: 'assistant',
    content: 'Bonjour ! Je suis votre assistant UniLife Hub 🎓\nComment puis-je vous aider ?',
    timestamp: new Date(),
    suggestions: this.quickQuestions
  });
}

  ngOnDestroy(): void {}

  sendMessage(text?: string): void {
    const message = text || this.inputMessage.trim();
    if (!message || this.loading) return;

    // Ajouter le message utilisateur
    this.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    this.inputMessage = '';
    this.loading = true;
    this.scrollToBottom();

    // Appeler l'API IA
    this.aiService.chat({
      message,
      userId: this.userId,
      conversationId: this.conversationId || undefined
    }).subscribe({
      next: res => {
        this.conversationId = res.conversationId;
        // Sauvegarder le conversationId
        localStorage.setItem(`conv_${this.userId}`, res.conversationId);
        this.messages.push({
          role: 'assistant',
          content: res.response,
          timestamp: new Date(),
          suggestions: res.suggestions
        });
        this.loading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
          content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
          timestamp: new Date()
        });
        this.loading = false;
        this.scrollToBottom();
      }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearConversation(): void {
    this.conversationId = null;
    this.messages = [{
      role: 'assistant',
      content: 'Conversation réinitialisée. Comment puis-je vous aider ?',
      timestamp: new Date(),
      suggestions: this.quickQuestions
    }];
  }

  goToShop(): void {
    this.router.navigate(['/student/ecommerce']);
  }

  goToCart(): void {
    this.router.navigate(['/student/ecommerce/cart']);
  }

  formatMessage(content: string): string {
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
      } catch (e) {}
    }, 100);
  }
}