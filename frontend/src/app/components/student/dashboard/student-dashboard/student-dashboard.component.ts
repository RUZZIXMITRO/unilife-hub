import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';

interface Course {
  name: string;
  status: 'active' | 'finished' | 'paused';
  daysLeft: number;
  progress: number;
  color: string;
}

interface WeekBar {
  label: string;
  value: number;
}

interface CourseEvent {
  date: string;
  title: string;
  time: string;
}

interface Todo {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  due: string;
  done: boolean;
}

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {

  userName = 'Étudiant';
  currentDate = new Date();
  calendarDays: number[] = [];
  calendarPadding: number[] = [];
  newTaskTitle = '';

  activeCourses: Course[] = [
    { name: 'Algorithmes & Structures', status: 'active',   daysLeft: 45, progress: 75,  color: '#2563eb' },
    { name: 'Base de données',          status: 'finished', daysLeft: 1,  progress: 100, color: '#1e293b' },
    { name: 'Réseaux informatiques',    status: 'active',   daysLeft: 15, progress: 45,  color: '#2563eb' },
    { name: 'Développement Web',        status: 'paused',   daysLeft: 21, progress: 60,  color: '#f59e0b' }
  ];

  weekBars: WeekBar[] = [
    { label: 'Lu', value: 80 },
    { label: 'Ma', value: 95 },
    { label: 'Me', value: 20 },
    { label: 'Je', value: 65 },
    { label: 'Ve', value: 40 },
    { label: 'Sa', value: 60 },
    { label: 'Di', value: 55 }
  ];

  upcomingEvents: CourseEvent[] = [
    { date: '2026-03-12', title: '10:13 Cours',    time: '10:13' },
    { date: '2026-03-22', title: '12:13 Révision', time: '12:13' }
  ];

  todos: Todo[] = [
    { id: 1, title: 'Rapport de stage à rendre',     priority: 'high',   due: '18 mars',  done: false },
    { id: 2, title: 'Révision examen Mathématiques', priority: 'high',   due: '22 mars',  done: false },
    { id: 3, title: 'TP Programmation Python',       priority: 'medium', due: '28 mars',  done: false },
    { id: 4, title: 'Lire chapitre 5 Algorithmes',   priority: 'low',    due: '30 mars',  done: true  },
    { id: 5, title: 'Préparer présentation PFA',     priority: 'high',   due: '15 avril', done: false }
  ];

  get pendingCount(): number { return this.todos.filter(t => !t.done).length; }
  get doneCount(): number    { return this.todos.filter(t => t.done).length; }

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.buildCalendar();
  }

  buildCalendar(): void {
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    let first = new Date(y, m, 1).getDay();
    this.calendarPadding = first > 0 ? Array(first).fill(0) : [];
    this.calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  isToday(day: number): boolean {
    return day === this.currentDate.getDate();
  }

  hasEvent(day: number): boolean {
    const y = this.currentDate.getFullYear();
    const m = String(this.currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return this.upcomingEvents.some(e => e.date === `${y}-${m}-${d}`);
  }

  getEventLabel(day: number): string {
    const y = this.currentDate.getFullYear();
    const m = String(this.currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const ev = this.upcomingEvents.find(e => e.date === `${y}-${m}-${d}`);
    return ev ? ev.title : '';
  }

  addTask(): void {
    const title = this.newTaskTitle.trim();
    if (!title) return;
    this.todos.unshift({
      id: Date.now(),
      title,
      priority: 'medium',
      due: 'À définir',
      done: false
    });
    this.newTaskTitle = '';
  }

  toggleTodo(todo: Todo): void { todo.done = !todo.done; }

  deleteTask(todo: Todo): void {
    this.todos = this.todos.filter(t => t.id !== todo.id);
  }

  getPrioColor(priority: string): string {
    return priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981';
  }

  loadUserProfile(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      const u = this.authService.getCurrentUser();
      if (u) this.userName = u.email?.split('@')[0] || '';
      return;
    }
    this.userService.getUserByCredentialId(userId).subscribe({
      next: (r) => { if (r.success && r.data) this.userName = r.data.name || 'Étudiant'; },
      error: () => { const u = this.authService.getCurrentUser(); if (u) this.userName = u.email?.split('@')[0] || ''; }
    });
  }

  getGreeting(): string {
    const h = this.currentDate.getHours();
    return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
  }
}