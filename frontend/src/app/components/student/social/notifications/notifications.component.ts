import { Component, OnInit } from '@angular/core';
import { SocialService, Notification } from '../../../../services/social.service';
import { UserService } from '../../../../services/user.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications: Notification[] = [];
  unreadCount = 0;
  isLoading = false;
  errorMessage = '';

  // ✅ Cache des noms (même pattern que feed)
  private userNameCache: { [userId: string]: string } = {};

  constructor(
    private socialService: SocialService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.socialService.getNotifications().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.notifications = res.data;
          this.enrichNotificationsWithUserNames(this.notifications);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = `Erreur ${err.status}: ${err.message}`;
        this.isLoading = false;
      }
    });

    this.socialService.getUnreadCount().subscribe({
      next: (res: any) => {
        if (res.success) this.unreadCount = res.data;
      }
    });
  }

  // ✅ Enrichir les notifications avec les vrais noms
  private enrichNotificationsWithUserNames(notifications: Notification[]): void {
    const uniqueUserIds = [...new Set(
      notifications
        .map(n => n.relatedUserId)
        .filter(id => id && !this.userNameCache[id])
    )];

    if (uniqueUserIds.length === 0) {
      this.applyUserNames();
      return;
    }

    const requests = uniqueUserIds.map(userId =>
      this.userService.getUserByCredentialId(userId).pipe(
        map(res => ({
          userId,
          name: res.success && res.data?.name ? res.data.name : 'Quelqu\'un'
        })),
        catchError(() => of({ userId, name: 'Quelqu\'un' }))
      )
    );

    forkJoin(requests).subscribe(results => {
      results.forEach(r => {
        this.userNameCache[r.userId] = r.name;
      });
      this.applyUserNames();
    });
  }

  // ✅ Remplacer "Quelqu'un" par le vrai nom dans le message
  private applyUserNames(): void {
    this.notifications = this.notifications.map(notif => ({
      ...notif,
      message: this.buildMessage(notif)
    }));
  }

  // ✅ Construire le message avec le vrai nom
  private buildMessage(notif: Notification): string {
    const name = this.userNameCache[notif.relatedUserId] || 'Quelqu\'un';
    const messages: { [key: string]: string } = {
      'LIKE':            `${name} a aimé votre post`,
      'COMMENT':         `${name} a commenté votre post`,
      'FRIEND_REQUEST':  `${name} vous a envoyé une demande d'ami`,
      'FRIEND_ACCEPTED': `${name} a accepté votre demande d'ami`,
      'GROUP_JOIN':      `${name} a rejoint votre groupe`,
      'GROUP_POST':      `${name} a publié dans votre groupe`,
      'MESSAGE':         `${name} vous a envoyé un message`
    };
    return messages[notif.type] || notif.message;
  }

  markAsRead(id: number): void {
    this.socialService.markNotificationAsRead(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          const notif = this.notifications.find(n => n.id === id);
          if (notif && !notif.read) {
            notif.read = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.socialService.unreadCount$.next(this.unreadCount);
          }
        }
      }
    });
  }

  markAllAsRead(): void {
    this.socialService.markAllNotificationsAsRead().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.notifications.forEach(n => n.read = true);
          this.unreadCount = 0;
          this.socialService.unreadCount$.next(0);
        }
      }
    });
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'LIKE':            'fa-solid fa-heart',
      'COMMENT':         'fa-solid fa-comment',
      'FRIEND_REQUEST':  'fa-solid fa-user-plus',
      'FRIEND_ACCEPTED': 'fa-solid fa-user-check',
      'GROUP_JOIN':      'fa-solid fa-people-group',
      'GROUP_POST':      'fa-solid fa-pen-to-square',
      'MESSAGE':         'fa-solid fa-envelope'
    };
    return icons[type] || 'fa-solid fa-bell';
  }

  getIconBg(type: string): string {
    const colors: { [key: string]: string } = {
      'LIKE':            'linear-gradient(135deg,#ef4444,#dc2626)',
      'COMMENT':         'linear-gradient(135deg,#2563eb,#1e40af)',
      'FRIEND_REQUEST':  'linear-gradient(135deg,#10b981,#059669)',
      'FRIEND_ACCEPTED': 'linear-gradient(135deg,#10b981,#059669)',
      'GROUP_JOIN':      'linear-gradient(135deg,#8b5cf6,#6d28d9)',
      'GROUP_POST':      'linear-gradient(135deg,#f59e0b,#d97706)',
      'MESSAGE':         'linear-gradient(135deg,#06b6d4,#0284c7)'
    };
    return colors[type] || 'linear-gradient(135deg,#94a3b8,#64748b)';
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return `Il y a ${Math.floor(diff / 86400)}j`;
  }
}