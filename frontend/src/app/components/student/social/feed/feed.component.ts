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

  constructor(private socialService: SocialService) {}

  ngOnInit(): void {
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