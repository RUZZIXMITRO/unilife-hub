import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AGENDA_API_URL } from './agenda.config';
import { TodoDto, CreateTodoDto } from '../../models/agenda/todo.model';

@Injectable()
export class TodoService {
  private apiUrl = `${AGENDA_API_URL}/todo/tasks`;

  constructor(private http: HttpClient) {}

  getMyTodos(): Observable<TodoDto[]> {
    return this.http.get<TodoDto[]>(this.apiUrl);
  }

  getOverdue(): Observable<TodoDto[]> {
    return this.http.get<TodoDto[]>(`${this.apiUrl}/overdue`);
  }

  getPending(): Observable<TodoDto[]> {
    return this.http.get<TodoDto[]>(`${this.apiUrl}/pending`);
  }

  getById(id: number): Observable<TodoDto> {
    return this.http.get<TodoDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateTodoDto): Observable<TodoDto> {
    return this.http.post<TodoDto>(this.apiUrl, dto);
  }

  update(id: number, dto: CreateTodoDto): Observable<TodoDto> {
    return this.http.put<TodoDto>(`${this.apiUrl}/${id}`, dto);
  }

  markAsCompleted(id: number): Observable<TodoDto> {
    return this.http.patch<TodoDto>(`${this.apiUrl}/${id}/complete`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}