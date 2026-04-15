import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  id: number;
  userId: number;
  userName: string;
  content: string;
  visibility: string;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  userName: string;
  content: string;
  parentCommentId: number | null;
  postId: number;
  createdAt: string;
}

export interface Friendship {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: string;
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  subject: string;
  creatorId: number;
  type: string;
  membersCount: number;
  isMember: boolean;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  relatedUserId: number;
  type: string;
  message: string;
  referenceId: number;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class SocialService {

  private apiUrl = 'https://localhost:8084/api/social';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ===== POSTS =====
  getFeed(): Observable<ApiResponse<Post[]>> {
    return this.http.get<ApiResponse<Post[]>>(
      `${this.apiUrl}/posts`,
      { headers: this.getHeaders() }
    );
  }

  getUserPosts(userId: number): Observable<ApiResponse<Post[]>> {
    return this.http.get<ApiResponse<Post[]>>(
      `${this.apiUrl}/posts/user/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  createPost(content: string, visibility: string): Observable<ApiResponse<Post>> {
    return this.http.post<ApiResponse<Post>>(
      `${this.apiUrl}/posts`,
      { content, visibility },
      { headers: this.getHeaders() }
    );
  }

  deletePost(postId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/posts/${postId}`,
      { headers: this.getHeaders() }
    );
  }

  toggleLike(postId: number): Observable<ApiResponse<Post>> {
    return this.http.post<ApiResponse<Post>>(
      `${this.apiUrl}/posts/${postId}/like`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ===== COMMENTS =====
  getComments(postId: number): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(
      `${this.apiUrl}/posts/${postId}/comments`,
      { headers: this.getHeaders() }
    );
  }

  addComment(postId: number, content: string): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(
      `${this.apiUrl}/posts/${postId}/comments`,
      { content },
      { headers: this.getHeaders() }
    );
  }

  // ===== FRIENDS =====
  getFriends(): Observable<ApiResponse<Friendship[]>> {
    return this.http.get<ApiResponse<Friendship[]>>(
      `${this.apiUrl}/friends`,
      { headers: this.getHeaders() }
    );
  }

  getPendingRequests(): Observable<ApiResponse<Friendship[]>> {
    return this.http.get<ApiResponse<Friendship[]>>(
      `${this.apiUrl}/friends/requests`,
      { headers: this.getHeaders() }
    );
  }

  sendFriendRequest(addresseeId: number): Observable<ApiResponse<Friendship>> {
    return this.http.post<ApiResponse<Friendship>>(
      `${this.apiUrl}/friends/request/${addresseeId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  acceptFriendRequest(friendshipId: number): Observable<ApiResponse<Friendship>> {
    return this.http.put<ApiResponse<Friendship>>(
      `${this.apiUrl}/friends/accept/${friendshipId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  rejectFriendRequest(friendshipId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/friends/reject/${friendshipId}`,
      { headers: this.getHeaders() }
    );
  }

  // ===== GROUPS =====
  getPublicGroups(): Observable<ApiResponse<Group[]>> {
    return this.http.get<ApiResponse<Group[]>>(
      `${this.apiUrl}/groups`,
      { headers: this.getHeaders() }
    );
  }

  searchGroups(keyword: string): Observable<ApiResponse<Group[]>> {
    return this.http.get<ApiResponse<Group[]>>(
      `${this.apiUrl}/groups/search?keyword=${keyword}`,
      { headers: this.getHeaders() }
    );
  }

  createGroup(name: string, description: string,
              subject: string, type: string): Observable<ApiResponse<Group>> {
    return this.http.post<ApiResponse<Group>>(
      `${this.apiUrl}/groups`,
      { name, description, subject, type },
      { headers: this.getHeaders() }
    );
  }

  joinGroup(groupId: number): Observable<ApiResponse<Group>> {
    return this.http.post<ApiResponse<Group>>(
      `${this.apiUrl}/groups/${groupId}/join`,
      {},
      { headers: this.getHeaders() }
    );
  }

  leaveGroup(groupId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/groups/${groupId}/leave`,
      { headers: this.getHeaders() }
    );
  }

  // ===== MESSAGES =====
  getConversation(userId: number): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(
      `${this.apiUrl}/messages/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  sendMessage(receiverId: number, content: string): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(
      `${this.apiUrl}/messages`,
      { receiverId, content },
      { headers: this.getHeaders() }
    );
  }

  // ===== NOTIFICATIONS =====
  getNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(
      `${this.apiUrl}/notifications`,
      { headers: this.getHeaders() }
    );
  }

  getUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/notifications/unread-count`,
      { headers: this.getHeaders() }
    );
  }

  markNotificationAsRead(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/notifications/${id}/read`,
      {},
      { headers: this.getHeaders() }
    );
  }

  markAllNotificationsAsRead(): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/notifications/read-all`,
      {},
      { headers: this.getHeaders() }
    );
  }
}