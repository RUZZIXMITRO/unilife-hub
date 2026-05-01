import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AiChatRequest, AiChatResponse } from '../models/ecommerce.models';

@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  private apiUrl = 'http://localhost:8090/api/ai';

  constructor(private http: HttpClient) {}

  chat(request: AiChatRequest): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(`${this.apiUrl}/chat`, request);
  }

  getConversations(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversations/${userId}`);
  }

  deleteConversation(conversationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/conversation/${conversationId}`);
  }
}