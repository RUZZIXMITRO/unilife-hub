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

  // Commentaires chargés par post
  loadedComments: { [key: number]: any[] } = {};

  // Réponse en cours
  replyTo: { [key: number]: number | null } = {};
  replyContent: { [key: number]: string } = {};

  // Signalement
  showReportModal = false;
  reportPostId: number | null = null;
  reportReason = '';

  // Utilisateur connecté
  currentUserId: number = 0;

  constructor(private socialService: SocialService) {}

  ngOnInit(): void {
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

  // ===== COMMENTAIRES =====
  toggleComments(postId: number): void {
    this.showComments[postId] = !this.showComments[postId];
    if (this.showComments[postId] && !this.loadedComments[postId]) {
      this.loadComments(postId);
    }
  }

  loadComments(postId: number): void {
    this.socialService.getComments(postId).subscribe({
      next: (res) => {
        if (res.success) this.loadedComments[postId] = res.data;
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
          if (!this.loadedComments[postId]) this.loadedComments[postId] = [];
          this.loadedComments[postId].push(res.data);
          const post = this.posts.find(p => p.id === postId);
          if (post) post.commentsCount++;
        }
      }
    });
  }

  // ===== RÉPONSES =====
  setReply(postId: number, commentId: number): void {
    this.replyTo[postId] = commentId;
    this.replyContent[postId] = '';
  }

  cancelReply(postId: number): void {
    this.replyTo[postId] = null;
    this.replyContent[postId] = '';
  }

  sendReply(postId: number): void {
    const content = this.replyContent[postId];
    const parentId = this.replyTo[postId];
    if (!content?.trim() || !parentId) return;
    this.socialService.addComment(postId, content, parentId).subscribe({
      next: (res) => {
        if (res.success) {
          this.replyContent[postId] = '';
          this.replyTo[postId] = null;
          this.loadComments(postId);
          const post = this.posts.find(p => p.id === postId);
          if (post) post.commentsCount++;
        }
      }
    });
  }

  getRootComments(postId: number): any[] {
    if (!this.loadedComments[postId]) return [];
    return this.loadedComments[postId].filter(c => !c.parentCommentId);
  }

  getReplies(postId: number, commentId: number): any[] {
    if (!this.loadedComments[postId]) return [];
    return this.loadedComments[postId].filter(c => c.parentCommentId === commentId);
  }

  // ===== SUPPRIMER POST =====
  deletePost(postId: number): void {
    if (!confirm('Supprimer ce post ?')) return;
    this.socialService.deletePost(postId).subscribe({
      next: (res) => {
        if (res.success) this.posts = this.posts.filter(p => p.id !== postId);
      }
    });
  }

  // ===== PARTAGER =====
  sharePost(postId: number): void {
    this.socialService.sharePost(postId).subscribe({
      next: (res) => {
        if (res.success) alert('Post partagé avec succès !');
      },
      error: () => alert('Vous avez déjà partagé ce post.')
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

  // ===== HELPERS =====
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