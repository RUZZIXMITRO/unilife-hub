import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';

interface StatCard {
  icon: string;
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

interface Task {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  completed: boolean;
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'exam' | 'course' | 'event';
}

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  userName = 'Étudiant';
  currentDate = new Date();

  stats: StatCard[] = [
    {
      icon: 'fa-solid fa-book-open',
      title: 'Cours actifs',
      value: 6,
      change: '+2 ce semestre',
      changeType: 'positive'
    },
    {
      icon: 'fa-solid fa-circle-check',
      title: 'Tâches complétées',
      value: '12/20',
      change: '60% complété',
      changeType: 'neutral'
    },
    {
      icon: 'fa-solid fa-calendar-days',
      title: 'Événements à venir',
      value: 5,
      change: '3 cette semaine',
      changeType: 'neutral'
    },
    {
      icon: 'fa-solid fa-box',
      title: 'Commandes actives',
      value: 2,
      change: 'En livraison',
      changeType: 'positive'
    }
  ];

  upcomingTasks: Task[] = [
    {
      id: 1,
      title: 'Rapport de stage à rendre',
      priority: 'high',
      dueDate: '2025-02-12',
      completed: false
    },
    {
      id: 2,
      title: 'Révision examen Mathématiques',
      priority: 'high',
      dueDate: '2025-02-15',
      completed: false
    },
    {
      id: 3,
      title: 'TP Programmation Python',
      priority: 'medium',
      dueDate: '2025-02-18',
      completed: false
    }
  ];

  upcomingEvents: Event[] = [
    {
      id: 1,
      title: 'Examen Mathématiques',
      date: '2025-02-15',
      time: '09:00',
      type: 'exam'
    },
    {
      id: 2,
      title: 'Cours Algorithmes',
      date: '2025-02-10',
      time: '14:00',
      type: 'course'
    },
    {
      id: 3,
      title: 'Séminaire IA',
      date: '2025-02-20',
      time: '10:00',
      type: 'event'
    }
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      console.warn('⚠️ Pas de userId, utilisation du token');
      const user = this.authService.getCurrentUser();
      if (user) {
        this.userName = user.email.split('@')[0];
      }
      return;
    }

    console.log('🔍 Dashboard - Chargement profil pour userId:', userId);

    this.userService.getUserByCredentialId(userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.userName = response.data.name || 'Étudiant';
          console.log('✅ Dashboard - Nom chargé:', this.userName);
        }
      },
      error: (error) => {
        console.error('❌ Dashboard - Erreur chargement profil:', error);
        
        // Fallback sur le token
        const user = this.authService.getCurrentUser();
        if (user) {
          this.userName = user.email.split('@')[0];
          console.log('⚠️ Dashboard - Utilisation fallback:', this.userName);
        }
      }
    });
  }

  getGreeting(): string {
    const hour = this.currentDate.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  toggleTaskComplete(task: Task): void {
    task.completed = !task.completed;
  }

  getPriorityColor(priority: string): string {
    switch(priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  }

  getEventIcon(type: string): string {
    switch(type) {
      case 'exam': return 'fa-solid fa-file-pen';
      case 'course': return 'fa-solid fa-chalkboard-user';
      case 'event': return 'fa-solid fa-calendar-star';
      default: return 'fa-solid fa-calendar';
    }
  }
}