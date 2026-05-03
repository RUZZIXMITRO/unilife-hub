import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../services/agenda/event.service';
import { EventDto, CreateEventDto, EVENT_TYPES } from '../../../../models/agenda/event.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: EventDto[];
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-agenda-page',
  templateUrl: './agenda-page.component.html',
  styleUrls: ['./agenda-page.component.css']
})
export class AgendaPageComponent implements OnInit {
  events: EventDto[] = [];
  loading = true;
  showForm = false;
  editingEventId: number | null = null;

  currentDate = new Date();
  selectedDate: Date = new Date();
  monthDays: CalendarDay[] = [];
  monthName = '';
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  eventTypes = EVENT_TYPES;
  newEvent: CreateEventDto = this.getEmptyEvent();

  constructor(private eventService: EventService) {}

  ngOnInit(): void { this.loadEvents(); }

  getEmptyEvent(): CreateEventDto {
    return {
      title: '', description: '', eventType: 'Course',
      startDateTime: '', endDateTime: '', location: '',
      hasReminder: false, reminderMinutesBefore: 60
    };
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getMyEvents().subscribe({
      next: (data) => { this.events = data; this.loading = false; this.buildCalendar(); },
      error: () => this.loading = false
    });
  }

  buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.monthName = this.currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7;

    this.monthDays = [];
    for (let i = startDay; i > 0; i--) {
      this.monthDays.push(this.makeDay(new Date(year, month, 1 - i), false));
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      this.monthDays.push(this.makeDay(new Date(year, month, d), true));
    }
    const remaining = 42 - this.monthDays.length;
    for (let i = 1; i <= remaining; i++) {
      this.monthDays.push(this.makeDay(new Date(year, month + 1, i), false));
    }
  }

  makeDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    return {
      date, isCurrentMonth,
      events: this.getEventsForDate(date),
      isToday: this.isSameDay(date, new Date()),
      isSelected: this.isSameDay(date, this.selectedDate)
    };
  }

  getEventsForDate(date: Date): EventDto[] {
    return this.events.filter(e => this.isSameDay(new Date(e.startDateTime), date));
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.toDateString() === d2.toDateString();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDate = day.date;
    this.buildCalendar();
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.buildCalendar();
  }

  goToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.buildCalendar();
  }

  get selectedDayEvents(): EventDto[] {
    return this.getEventsForDate(this.selectedDate);
  }

  openCreateForm(): void {
    this.editingEventId = null;
    this.newEvent = this.getEmptyEvent();
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    this.newEvent.startDateTime = `${dateStr}T09:00`;
    this.newEvent.endDateTime = `${dateStr}T10:00`;
    this.showForm = true;
  }

  openEditForm(event: EventDto): void {
    this.editingEventId = event.id;
    this.newEvent = {
      title: event.title, description: event.description,
      eventType: event.eventType,
      startDateTime: event.startDateTime.substring(0, 16),
      endDateTime: event.endDateTime.substring(0, 16),
      location: event.location, hasReminder: event.hasReminder,
      reminderMinutesBefore: 60
    };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingEventId = null;
    this.newEvent = this.getEmptyEvent();
  }

  saveEvent(): void {
    if (!this.newEvent.title.trim() || !this.newEvent.startDateTime || !this.newEvent.endDateTime) {
      alert('Champs obligatoires manquants');
      return;
    }
    if (this.editingEventId) {
      this.eventService.update(this.editingEventId, this.newEvent).subscribe({
        next: () => { this.cancelForm(); this.loadEvents(); }
      });
    } else {
      this.eventService.create(this.newEvent).subscribe({
        next: () => { this.cancelForm(); this.loadEvents(); }
      });
    }
  }

  deleteEvent(event: EventDto): void {
    if (confirm(`Supprimer "${event.title}" ?`)) {
      this.eventService.delete(event.id).subscribe({
        next: () => this.loadEvents()
      });
    }
  }

  getEventColor(type: string): string {
    const colors: any = {
      'Course': '#2563eb', 'Exam': '#ef4444',
      'TD': '#06b6d4', 'Personal': '#06d6a0', 'Other': '#94a3b8'
    };
    return colors[type] || '#94a3b8';
  }
}