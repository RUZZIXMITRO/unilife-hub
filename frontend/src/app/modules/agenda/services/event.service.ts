import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AGENDA_API_URL } from '../agenda.config';
import { EventDto, CreateEventDto } from '../models/event.model';

@Injectable()
export class EventService {
  private apiUrl = `${AGENDA_API_URL}/agenda/events`;

  constructor(private http: HttpClient) {}

  getMyEvents(): Observable<EventDto[]> {
    return this.http.get<EventDto[]>(this.apiUrl);
  }

  getCalendar(view: 'daily' | 'weekly' | 'monthly', date: string): Observable<EventDto[]> {
    return this.http.get<EventDto[]>(`${this.apiUrl}/calendar?view=${view}&date=${date}`);
  }

  getById(id: number): Observable<EventDto> {
    return this.http.get<EventDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateEventDto): Observable<EventDto> {
    return this.http.post<EventDto>(this.apiUrl, dto);
  }

  update(id: number, dto: CreateEventDto): Observable<EventDto> {
    return this.http.put<EventDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}