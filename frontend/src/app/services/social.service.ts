import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ===== INTERFACES (userId: string partout — BUG #1 fix) =====
export interface Post {
  id: number;
  userId: string;        // ✅ string UUID
  userName: string;
  userAvatar?: string | null; // ✅ AJOUTER
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
  userId: string;        // ✅ string UUID
  userName: string;
  content: string;
  parentCommentId: number | null;
  postId: number;
  createdAt: string;
}

export interface Friendship {
  id: number;
  requesterId: string;   // ✅ string UUID
  addresseeId: string;   // ✅ string UUID
  status: string;
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  subject: string;
  creatorId: string;     // ✅ string UUID
  type: string;
  membersCount: number;
  isMember: boolean;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: string;      // ✅ string UUID
  receiverId: string;    // ✅ string UUID
  conversationId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: string;        // ✅ string UUID
  relatedUserId: string; // ✅ string UUID
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

export interface Share {
  id: number;
  postId: number;
  userId: string;        // ✅ string UUID
  createdAt: string;
  shareCount: number;
}

export interface BlockList {
  id: number;
  blockerId: string;     // ✅ string UUID
  blockedId: string;     // ✅ string UUID
  blockedAt: string;
}

export interface Conversation {
  id: number;
  user1Id: string;       // ✅ string UUID
  user2Id: string;       // ✅ string UUID
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: number;
  userId: string;        // ✅ string UUID
  groupId: number;
  role: string;
  status: string;
  joinedAt: string;
}

export interface GroupPost {
  id: number;
  groupId: number;
  postId: number;
  postedBy: string;      // ✅ string UUID
  postedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialService {

  private apiUrl = 'http://localhost:5000/api/social';

  // ✅ Phase 1.6 : Plus de getHeaders() — l'interceptor gère Authorization
  constructor(private http: HttpClient) {}

  // ===== POSTS =====
  getFeed(): Observable<ApiResponse<Post[]>> {
    return this.http.get<ApiResponse<Post[]>>(`${this.apiUrl}/posts`);
  }

  getUserPosts(userId: string): Observable<ApiResponse<Post[]>> {
    return this.http.get<ApiResponse<Post[]>>(`${this.apiUrl}/posts/user/${userId}`);
  }

  createPost(content: string, visibility: string, userName: string = 'Utilisateur'): Observable<ApiResponse<Post>> {
  return this.http.post<ApiResponse<Post>>(
    `${this.apiUrl}/posts`,
    {
      content,
      visibility,
      userName,       // ✅ envoyé au backend
      userAvatar: null
    }
  );
}

  deletePost(postId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/posts/${postId}`);
  }

  toggleLike(postId: number): Observable<ApiResponse<Post>> {
    return this.http.post<ApiResponse<Post>>(`${this.apiUrl}/posts/${postId}/like`, {});
  }

  // ===== SHARE =====
  sharePost(postId: number): Observable<ApiResponse<Share>> {
    return this.http.post<ApiResponse<Share>>(`${this.apiUrl}/posts/${postId}/share`, {});
  }

  unsharePost(postId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/posts/${postId}/share`);
  }

  getShareCount(postId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/posts/${postId}/shares/count`);
  }

  // ===== SIGNALEMENT =====
  reportPost(postId: number, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reports`,
      { contentId: postId, contentType: 'POST', reason });
  }

  reportComment(commentId: number, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reports`,
      { contentId: commentId, contentType: 'COMMENT', reason });
  }

  // ===== COMMENTS =====
  getComments(postId: number): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(`${this.apiUrl}/posts/${postId}/comments`);
  }

  addComment(postId: number, content: string, parentCommentId?: number): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(`${this.apiUrl}/posts/${postId}/comments`,
      { content, parentCommentId: parentCommentId || null });
  }

  // ===== FRIENDS =====
  getFriends(): Observable<ApiResponse<Friendship[]>> {
    return this.http.get<ApiResponse<Friendship[]>>(`${this.apiUrl}/friends`);
  }

  getPendingRequests(): Observable<ApiResponse<Friendship[]>> {
    return this.http.get<ApiResponse<Friendship[]>>(`${this.apiUrl}/friends/requests`);
  }

  sendFriendRequest(addresseeId: string): Observable<ApiResponse<Friendship>> {
    return this.http.post<ApiResponse<Friendship>>(
      `${this.apiUrl}/friends/request/${addresseeId}`, {});
  }

  acceptFriendRequest(friendshipId: number): Observable<ApiResponse<Friendship>> {
    return this.http.put<ApiResponse<Friendship>>(
      `${this.apiUrl}/friends/accept/${friendshipId}`, {});
  }

  rejectFriendRequest(friendshipId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/friends/reject/${friendshipId}`);
  }

  // ===== BLOCAGE =====
  blockUser(userId: string): Observable<ApiResponse<BlockList>> {
    return this.http.post<ApiResponse<BlockList>>(
      `${this.apiUrl}/users/${userId}/block`, {});
  }

  unblockUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/users/${userId}/unblock`);
  }

  getBlockedUsers(): Observable<ApiResponse<BlockList[]>> {
    return this.http.get<ApiResponse<BlockList[]>>(`${this.apiUrl}/users/blocked`);
  }

  // ===== GROUPS =====
  getPublicGroups(): Observable<ApiResponse<Group[]>> {
    return this.http.get<ApiResponse<Group[]>>(`${this.apiUrl}/groups`);
  }

  searchGroups(keyword: string): Observable<ApiResponse<Group[]>> {
    // ✅ BUG #26 : encodeURIComponent pour éviter injection dans l'URL
    return this.http.get<ApiResponse<Group[]>>(
      `${this.apiUrl}/groups/search?keyword=${encodeURIComponent(keyword)}`);
  }

  createGroup(name: string, description: string,
              subject: string, type: string): Observable<ApiResponse<Group>> {
    return this.http.post<ApiResponse<Group>>(
      `${this.apiUrl}/groups`, { name, description, subject, type });
  }

  joinGroup(groupId: number): Observable<ApiResponse<Group>> {
    return this.http.post<ApiResponse<Group>>(`${this.apiUrl}/groups/${groupId}/join`, {});
  }

  leaveGroup(groupId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/groups/${groupId}/leave`);
  }

  getGroupMembers(groupId: number): Observable<ApiResponse<GroupMember[]>> {
    return this.http.get<ApiResponse<GroupMember[]>>(
      `${this.apiUrl}/groups/${groupId}/members`);
  }

  getPendingMembers(groupId: number): Observable<ApiResponse<GroupMember[]>> {
    return this.http.get<ApiResponse<GroupMember[]>>(
      `${this.apiUrl}/groups/${groupId}/members/pending`);
  }

  approveMember(groupId: number, userId: string): Observable<ApiResponse<GroupMember>> {
    return this.http.put<ApiResponse<GroupMember>>(
      `${this.apiUrl}/groups/${groupId}/members/${userId}/approve`, {});
  }

  rejectMember(groupId: number, userId: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/groups/${groupId}/members/${userId}/reject`, {});
  }

  removeMember(groupId: number, userId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/groups/${groupId}/members/${userId}`);
  }

  getGroupPosts(groupId: number): Observable<ApiResponse<GroupPost[]>> {
    return this.http.get<ApiResponse<GroupPost[]>>(
      `${this.apiUrl}/groups/${groupId}/posts`);
  }

  addPostToGroup(groupId: number, postId: number): Observable<ApiResponse<GroupPost>> {
    return this.http.post<ApiResponse<GroupPost>>(
      `${this.apiUrl}/groups/${groupId}/posts/${postId}`, {});
  }

  // ===== MESSAGES =====
  getConversation(userId: string): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.apiUrl}/messages/${userId}`);
  }

  sendMessage(receiverId: string, content: string): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(
      `${this.apiUrl}/messages`, { receiverId, content });
  }

  // ===== CONVERSATIONS =====
  getConversations(): Observable<ApiResponse<Conversation[]>> {
    return this.http.get<ApiResponse<Conversation[]>>(`${this.apiUrl}/conversations`);
  }

  startConversation(userId: string): Observable<ApiResponse<Conversation>> {
    return this.http.post<ApiResponse<Conversation>>(
      `${this.apiUrl}/conversations/${userId}/start`, {});
  }

  // ===== NOTIFICATIONS =====
  getNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}/notifications`);
  }

  getUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/notifications/unread-count`);
  }

  markNotificationAsRead(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  markAllNotificationsAsRead(): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/notifications/read-all`, {});
  }
}