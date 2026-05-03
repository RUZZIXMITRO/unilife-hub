import { Component, OnInit } from '@angular/core';
import { SocialService, Post } from '../../../../services/social.service';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
  loadedComments: { [key: number]: any[] } = {};
  replyTo: { [key: number]: number | null } = {};
  replyContent: { [key: number]: string } = {};
  showReportModal = false;
  reportPostId: number | null = null;
  reportReason = '';
  currentUserId: string = '';
  selectedPhotoName = '';

  // Cache des noms pour éviter les appels répétés
  private userNameCache: { [userId: string]: string } = {};

  constructor(
    private socialService: SocialService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUserId =
    this.authService.getCurrentUser()?.id || this.authService.getUserId() || '';
    this.loadFeed();
  }

  loadFeed(): void {
    this.isLoading = true;
    this.socialService.getFeed().subscribe({
      next: (res) => {
        if (res.success) {
          this.posts = res.data;
          this.enrichPostsWithUserNames(this.posts);
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  // ✅ Enrichir les posts avec les vrais noms
  private enrichPostsWithUserNames(posts: Post[]): void {
    // Récupérer les userId uniques (pas encore en cache)
    const uniqueUserIds = [...new Set(
      posts
        .map(p => p.userId)
        .filter(id => id && !this.userNameCache[id])
    )];

    if (uniqueUserIds.length === 0) {
      this.applyUserNames();
      return;
    }

    // Appeler UserService pour chaque userId unique
    const requests = uniqueUserIds.map(userId =>
      this.userService.getUserByCredentialId(userId).pipe(
        map(res => ({
          userId,
          name: res.success && res.data?.name
            ? res.data.name
            : this.fallbackName(userId)
        })),
        catchError(() => of({
          userId,
          name: this.fallbackName(userId)
        }))
      )
    );

    forkJoin(requests).subscribe(results => {
      results.forEach(r => {
        this.userNameCache[r.userId] = r.name;
      });
      this.applyUserNames();
    });
  }

  // ✅ Appliquer les noms mis en cache sur les posts
  private applyUserNames(): void {
    this.posts = this.posts.map(post => ({
      ...post,
      userName: this.userNameCache[post.userId] || this.fallbackName(post.userId)
    }));
  }

  // ✅ Fallback : email depuis localStorage ou initiales UUID
  private fallbackName(userId: string): string {
    // Si c'est l'utilisateur connecté, utiliser son email
    if (userId === this.currentUserId) {
      const user = this.authService.getCurrentUser();
      return user?.email?.split('@')[0] || 'Étudiant';
    }
    return 'Étudiant';
  }

  createPost(): void {
    if (!this.newPostContent.trim()) return;
    this.socialService.createPost(
      this.newPostContent,
      this.newPostVisibility
    ).subscribe({
      next: (res) => {
        if (res.success) {
          // Enrichir le nouveau post avant de l'ajouter
          const newPost = {
            ...res.data,
            userName: this.userNameCache[res.data.userId]
              || this.authService.getCurrentUser()?.email?.split('@')[0]
              || 'Étudiant'
          };
          this.posts.unshift(newPost);
          this.newPostContent = '';
        }
      }
    });
  }

  triggerPhotoPicker(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    this.selectedPhotoName = file ? file.name : '';
  }

  toggleLike(post: Post): void {
    this.socialService.toggleLike(post.id).subscribe({
      next: (res) => {
        if (res.success) {
          const index = this.posts.findIndex(p => p.id === post.id);
          if (index !== -1) {
            // ✅ Garder le userName existant
            this.posts[index] = {
              ...res.data,
              userName: this.posts[index].userName
            };
          }
        }
      }
    });
  }

  loadComments(postId: number): void {
    this.socialService.getComments(postId).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadedComments[postId] = res.data;
          // ✅ Enrichir les commentaires aussi
          this.enrichCommentsWithUserNames(postId, res.data);
        }
      }
    });
  }

  // ✅ Enrichir les commentaires avec les vrais noms
  private enrichCommentsWithUserNames(postId: number, comments: any[]): void {
    const uniqueUserIds = [...new Set(
      comments
        .map((c: any) => c.userId)
        .filter((id: string) => id && !this.userNameCache[id])
    )];

    if (uniqueUserIds.length === 0) {
      this.applyCommentUserNames(postId);
      return;
    }

    const requests = uniqueUserIds.map(userId =>
      this.userService.getUserByCredentialId(userId).pipe(
        map(res => ({
          userId,
          name: res.success && res.data?.name
            ? res.data.name
            : this.fallbackName(userId)
        })),
        catchError(() => of({
          userId,
          name: this.fallbackName(userId)
        }))
      )
    );

    forkJoin(requests).subscribe(results => {
      results.forEach(r => {
        this.userNameCache[r.userId] = r.name;
      });
      this.applyCommentUserNames(postId);
    });
  }

  private applyCommentUserNames(postId: number): void {
    if (this.loadedComments[postId]) {
      this.loadedComments[postId] = this.loadedComments[postId].map(c => ({
        ...c,
        userName: this.userNameCache[c.userId] || this.fallbackName(c.userId)
      }));
    }
  }

  // ===== RESTE INCHANGÉ =====
  toggleComments(postId: number): void {
    this.showComments[postId] = !this.showComments[postId];
    if (this.showComments[postId] && !this.loadedComments[postId]) {
      this.loadComments(postId);
    }
  }

  addComment(postId: number): void {
    const content = this.newComment[postId];
    if (!content?.trim()) return;
    this.socialService.addComment(postId, content).subscribe({
      next: (res) => {
        if (res.success) {
          this.newComment[postId] = '';
          if (!this.loadedComments[postId]) this.loadedComments[postId] = [];
          // ✅ Ajouter le userName au nouveau commentaire
          const newComment = {
            ...res.data,
            userName: this.userNameCache[res.data.userId]
              || this.authService.getCurrentUser()?.email?.split('@')[0]
              || 'Étudiant'
          };
          this.loadedComments[postId].push(newComment);
          const post = this.posts.find(p => p.id === postId);
          if (post) post.commentsCount++;
        }
      }
    });
  }

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

  deletePost(postId: number): void {
    if (!confirm('Supprimer ce post ?')) return;
    this.socialService.deletePost(postId).subscribe({
      next: (res) => {
        if (res.success) this.posts = this.posts.filter(p => p.id !== postId);
      }
    });
  }

  sharePost(postId: number): void {
    this.socialService.sharePost(postId).subscribe({
      next: (res) => {
        if (res.success) alert('Post partagé avec succès !');
      },
      error: () => alert('Vous avez déjà partagé ce post.')
    });
  }

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