import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  suggestions?: string[];
}

export interface ChatRequest {
  message: string;
  user_id: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  intent?: string;
  suggestions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  private apiUrl = 'http://localhost:8091/api/assistant';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  sendMessage(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request);
  }

  getConversations(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversations/${userId}`);
  }

  deleteConversation(conversationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/conversation/${conversationId}`);
  }

  getUserId(): string {
    return this.authService.getUserId() || 'anonymous';
  }
}