import { Component, OnInit } from '@angular/core';
import { AgendaNotificationService } from '../../services/agenda-notification.service';
import { NotificationDto } from '../../models/notification.model';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.css']
})
export class NotificationsPageComponent implements OnInit {
  notifications: NotificationDto[] = [];
  loading = true;
  filter: 'all' | 'unread' = 'all';

  constructor(private notifService: AgendaNotificationService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.notifService.getMyNotifications().subscribe({
      next: (data) => { this.notifications = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  markAsRead(notif: NotificationDto): void {
    if (notif.isRead) return;
    this.notifService.markAsRead(notif.id).subscribe({
      next: () => notif.isRead = true
    });
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead().subscribe({
      next: () => this.load()
    });
  }

  deleteNotif(notif: NotificationDto): void {
    if (confirm('Supprimer cette notification ?')) {
      this.notifService.delete(notif.id).subscribe({
        next: () => this.notifications = this.notifications.filter(n => n.id !== notif.id)
      });
    }
  }

  get filteredNotifications(): NotificationDto[] {
    if (this.filter === 'unread') return this.notifications.filter(n => !n.isRead);
    return this.notifications;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getIcon(type: string): string {
    const icons: any = {
      'EVENT_DELETED': '🗑️', 'EVENT_IMMINENT': '🔔',
      'EVENT_24H_BEFORE': '⏰', 'DAILY_REMINDER': '☀️', 'TASK_OVERDUE': '⚠️'
    };
    return icons[type] || '📨';
  }

  timeAgo(d: string): string {
    const diff = Math.floor((new Date().getTime() - new Date(d).getTime()) / 1000);
    if (diff < 60) return 'a l instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return new Date(d).toLocaleDateString('fr-FR');
  }
}