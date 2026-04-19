import { Component, OnInit } from '@angular/core';
import { SocialService, Post } from '../../../../services/social.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  posts: Post[] = [];
  newPostContent = '';
  newPostVisibility = 'PUBLIC';
  isLoading = false;
  showComments: { [key: number]: boolean } = {};
  newComment: { [key: number]: string } = {};

  // Signalement
  showReportModal = false;
  reportPostId: number | null = null;
  reportReason = '';

  // Utilisateur connecté
  currentUserId: number = 0;

  constructor(private socialService: SocialService) {}

  ngOnInit(): void {
    // Récupérer l'userId depuis le token JWT stocké
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.userId || payload.sub || 0;
      } catch (e) {
        this.currentUserId = 0;
      }
    }
    this.loadFeed();
  }

  loadFeed(): void {
    this.isLoading = true;
    this.socialService.getFeed().subscribe({
      next: (res) => {
        if (res.success) this.posts = res.data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  createPost(): void {
    if (!this.newPostContent.trim()) return;
    this.socialService.createPost(
      this.newPostContent,
      this.newPostVisibility
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.posts.unshift(res.data);
          this.newPostContent = '';
        }
      }
    });
  }

  toggleLike(post: Post): void {
    this.socialService.toggleLike(post.id).subscribe({
      next: (res) => {
        if (res.success) {
          const index = this.posts.findIndex(p => p.id === post.id);
          if (index !== -1) this.posts[index] = res.data;
        }
      }
    });
  }

  toggleComments(postId: number): void {
    this.showComments[postId] = !this.showComments[postId];
  }

  deletePost(postId: number): void {
    if (!confirm('Supprimer ce post ?')) return;
    this.socialService.deletePost(postId).subscribe({
      next: (res) => {
        if (res.success) {
          this.posts = this.posts.filter(p => p.id !== postId);
        }
      }
    });
  }

  addComment(postId: number): void {
    const content = this.newComment[postId];
    if (!content?.trim()) return;
    this.socialService.addComment(postId, content).subscribe({
      next: (res) => {
        if (res.success) {
          this.newComment[postId] = '';
          const post = this.posts.find(p => p.id === postId);
          if (post) post.commentsCount++;
        }
      }
    });
  }

  // ===== PARTAGER =====
  sharePost(postId: number): void {
    this.socialService.sharePost(postId).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Post partagé avec succès !');
        }
      },
      error: () => {
        alert('Vous avez déjà partagé ce post.');
      }
    });
  }

  // ===== SIGNALER =====
  openReportModal(postId: number): void {
    this.reportPostId = postId;
    this.reportReason = '';
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.reportPostId = null;
    this.reportReason = '';
  }

  submitReport(): void {
    if (!this.reportReason.trim() || this.reportPostId === null) return;
    this.socialService.reportPost(this.reportPostId, this.reportReason).subscribe({
      next: () => {
        alert('Signalement envoyé. Merci !');
        this.closeReportModal();
      },
      error: () => {
        alert('Erreur lors du signalement.');
        this.closeReportModal();
      }
    });
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

  getInitial(name: string): string {
    return name ? name[0].toUpperCase() : 'U';
  }
}